"use client";
import { useGetAllListByCategoryQuery } from "@/_lib/rtkQuery/listRtkQuery";
import Header from "../genericComponents/header";
import { Key, useState } from "react";
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import jobCategory from "@/_lib/utils/utils";
import JobTable from "./Table";

type ListDataType = {
  createdAt: string;
  //   importantLink: [];
  jobCategory: string;
  postName: string;
  postTitle: string;
  qualification: string;
  updatedAt: string;
  __v: 0;
  _id: string;
};

const ListLanding = () => {
  const [jobCategorySelected, setJobCategorySelected] = useState<string>("");
  const [jobCategorySelectedLabel, setJobCategorySelectedLabel] =
    useState<string>("");
  const [page, setPage] = useState(1);
  const { data } = useGetAllListByCategoryQuery(
    {
      jobCategory: jobCategorySelected,
      pageNo: page,
    },
    { skip: !jobCategorySelected }
  );

  const handleAction = (key: Key) => {
    const selectedItem = jobCategory.find(
      (item) => item.key === (key as string)
    );
    if (selectedItem) {
      setJobCategorySelected(selectedItem.key);
      setJobCategorySelectedLabel(selectedItem.label);
    }
  };

  return (
    <div className="p-5">
      <Dropdown>
        <DropdownTrigger>
          <Button className="w-full" variant="bordered">
            {jobCategorySelectedLabel || "Select Job Category"}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          className="h-[300px] overflow-auto scrollbar-hide py-5 w-full"
          aria-label="Dynamic Actions"
          items={jobCategory}
          onAction={handleAction}
        >
          {(item) => (
            <DropdownItem
              className={`w-full ${
                jobCategorySelected === item.key ? "bg-blue-500 text-white" : ""
              }`}
              key={item.key}
            >
              {item.label}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
      <Divider className="my-8" />
      {data && data.data.length > 0 ? (
        <JobTable
          data={data}
          setPage={setPage}
          page={page}
          jobCategorySelected={jobCategorySelected}
        />
      ) : (
        <div>Nothing</div>
      )}
    </div>
  );
};

export default ListLanding;
