"use client";
import JobForm from "@/_components/genericComponents/jobForm";
import { useParams } from "next/navigation";

const EditJob: React.FC = () => {
  const { category, slug } = useParams();

  return (
    <>
      {" "}
      <div>
        <JobForm
          jobCategoryName={category as string}
          postNameSlug={slug as string}
          jobFormTitle="Edit Job"
        />
      </div>
    </>
  );
};

export default EditJob;
