import ListLanding from "@/_components/listPage/Landing";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Job List",
  description: "All Job List Details Category Wise",
};

const JobList: React.FC = () => {
  return (
    <>
      <ListLanding />
    </>
  );
};

export default JobList;
