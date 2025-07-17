import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Input from './../../components/Inputs/Input';
import SpinnerLoader from './../../components/Loader/SpinnerLoader';
import axiosInstance from './../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const CreateSessionForm = () => {

    const [formData, setFormData] = useState({
        role: "",
        experience: "",
        topicsToFocus: "",
        description: ""
    });

    const [isloading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleChange = (key, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [key]: value
        }))
    }

    const handleCreateSession = async (e) => {
        e.preventDefault();

        const { role, experience, topicsToFocus } = formData;

        if (!role || !experience || !topicsToFocus) {
            setError("Please fill all the required fields.")
            return
        }

        setError("")

        try {

            setIsLoading(true);
            //Call AI API to generate questions
            const aiResponse = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, {
                role, experience, topicsToFocus, numberofQuestions: 10
            })

            //Should be array like [{question,answer},...]
            const generatedQuestions = aiResponse.data;

            const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
                ...formData,
                questions: generatedQuestions
            });

            if (response.data?.session?._id) {
                navigate(`/interview-prep/${response.data?.session?._id}`);
            }

        } catch (error) {
            if (error.response && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false)
        }


    }

    return (
        <div className='w-[90vw] md:w-[35vw] p-7 flex flex-col justify-center'>
            <h3 className='text-lg font-semibold text-black'>
                Start a New Interview Journey
            </h3>

            <p className='text-xs text-slate-700 mt-[5px] mb-3'>
                Fill out a few quick details and unlock your personalized set of interview questions!
            </p>

            <form onSubmit={handleCreateSession}
                className='flex flex-col gap-3'>
                <Input
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    label="Target Role"
                    placeholder={"e.g., Frontend Developer , Ui/Ux Designer,etc."}
                    type={"text"}
                />

                <Input
                    value={formData.experience}
                    onChange={(e) => handleChange("experience", e.target.value)}
                    label="Years of experience"
                    placeholder={"e.g., 1 year, 3 years, 5+ years"}
                    type={"number"}
                />

                <Input
                    value={formData.topicsToFocus}
                    onChange={(e) => handleChange("topicsToFocus", e.target.value)}
                    label="topics To Focus on"
                    placeholder={"Comma sepearated, e.g., React,Node.js,MongoDB"}
                    type={"text"}
                />

                <Input
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    label="Description"
                    placeholder={"Any specific goals or notes for this  session"}
                    type={"text"}
                />

                {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

                <button
                    type='submit'
                    className='w-full bg-black text-white text-sm font-semibold px-6 py-2.5  hover:bg-yellow-100 hover:text-black transition-colors cursor-pointer flex justify-center '
                    disabled={isloading}
                >
                    {isloading && <SpinnerLoader />} CreateSession
                </button>


            </form>

        </div>


    )
}

export default CreateSessionForm