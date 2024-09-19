"use client";
import { useParams } from "next/navigation";

const JobList: React.FC = () => {
  const { category, slug } = useParams();

  return (
    <>
      <h2>
        Edit Job : {category} , {slug}
      </h2>
    </>
  );
};

export default JobList;
