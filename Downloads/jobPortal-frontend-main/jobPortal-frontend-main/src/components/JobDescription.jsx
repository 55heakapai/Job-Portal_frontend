/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const ApplyForm = ({ jobId, onClose, onSuccess }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const validateForm = () => {
    if (!fullName.trim()) {
      toast.error("Full Name is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phone || !phoneRegex.test(phone)) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phone", phone);



      const res = await fetch(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Application submitted successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Application failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 border p-4 rounded-md bg-gray-50 shadow-sm space-y-4">
      <div>
        <label className="block mb-1 font-medium">Full Name *</label>
        <input
          type="text"
          required
          className="w-full p-2 border rounded"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Email *</label>
        <input
          type="email"
          required
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Phone Number *</label>
        <input
          type="tel"
          required
          className="w-full p-2 border rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1234567890"
        />
      </div>


      <div className="flex gap-4">
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Submit</button>
        <button type="button" onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
      </div>
    </form>
  );
};

const JobDescription = () => {
  const { singleJob } = useSelector(store => store.job);
  const { user } = useSelector(store => store.auth);
  const isInitiallyApplied = singleJob?.applications?.some(app => app.applicant === user?._id) || false;
  const [isApplied, setIsApplied] = useState(isInitiallyApplied);
  const [showForm, setShowForm] = useState(false);

  const params = useParams();
  const jobId = params.id;
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
          setIsApplied(res.data.job.applications.some(app => app.applicant === user?._id));
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchSingleJob();
  }, [jobId, dispatch, user?._id]);

  const handleApplySuccess = () => {
    setIsApplied(true);
    const updatedSingleJob = {
      ...singleJob,
      applications: [...singleJob.applications, { applicant: user?._id }],
    };
    dispatch(setSingleJob(updatedSingleJob));
    toast.success("Application submitted!");
  };

  return (
    <div className="max-w-7xl mx-auto my-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl">{singleJob?.title}</h1>
          <div className="flex items-center gap-2 mt-4">
            <Badge className={'text-blue-700 font-bold'} variant="ghost">{singleJob?.position} Positions</Badge>
            <Badge className={'text-[#F83002] font-bold'} variant="ghost">{singleJob?.jobType}</Badge>
            <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{singleJob?.salary}LPA</Badge>
          </div>
        </div>

        <Button
          onClick={isApplied ? null : () => setShowForm(true)}
          disabled={isApplied}
          className={`rounded-lg ${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#7209b7] hover:bg-[#5f32ad]'}`}
        >
          {isApplied ? 'Already Applied' : 'Apply Now'}
        </Button>
      </div>

      <h1 className="border-b-2 border-b-gray-300 font-medium py-4">Job Description</h1>
      <div className="my-4">
        <h1 className="font-bold my-1">Role: <span className="pl-4 font-normal text-gray-800">{singleJob?.title}</span></h1>
        <h1 className="font-bold my-1">Location: <span className="pl-4 font-normal text-gray-800">{singleJob?.location}</span></h1>
        <h1 className="font-bold my-1">Description: <span className="pl-4 font-normal text-gray-800">{singleJob?.description}</span></h1>
        <h1 className="font-bold my-1">Experience: <span className="pl-4 font-normal text-gray-800">{singleJob?.experience} yrs</span></h1>
        <h1 className="font-bold my-1">Salary: <span className="pl-4 font-normal text-gray-800">{singleJob?.salary}LPA</span></h1>
        <h1 className="font-bold my-1">Total Applicants: <span className="pl-4 font-normal text-gray-800">{singleJob?.applications?.length}</span></h1>
        <h1 className="font-bold my-1">Posted Date: <span className="pl-4 font-normal text-gray-800">{singleJob?.createdAt?.split("T")[0]}</span></h1>
      </div>

      {showForm && (
        <ApplyForm
          jobId={jobId}
          onClose={() => setShowForm(false)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
};

export default JobDescription;
