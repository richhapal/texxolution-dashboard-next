"use client";
import {
  useGetAllJobCategoryTypeListCachedQuery,
  useGetAllListByCategoryQuery,
  useLazyGetClearCategoryDetailsCacheClearPublishJobQuery,
} from "@/_lib/rtkQuery/listRtkQuery";
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
import JobTable from "./Table";
import NoContentFound from "../genericComponents/noContentFound";

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

  const { data: categoryListDetails, isLoading } =
    useGetAllJobCategoryTypeListCachedQuery({});
  console.log({ categoryListDetails });

  const handleAction = (key: Key) => {
    const selectedItem = [
      ...(categoryListDetails?.categories ?? []),
      ...(categoryListDetails?.data ?? []),
    ].find((item: any) => item.key === (key as string));
    if (selectedItem) {
      setJobCategorySelected(selectedItem.key);
      setJobCategorySelectedLabel(selectedItem.label);
    }
  };

  const [clearJobDetailsCache, { isFetching: isClearingCache }] =
    useLazyGetClearCategoryDetailsCacheClearPublishJobQuery({});

  const handleClearJobDetailsCache = async () => {
    if (!jobCategorySelected) return;
    try {
      await clearJobDetailsCache({ jobCategory: jobCategorySelected });
    } catch (err) {
      console.error("Error clearing cache of job details:", err);
    }
  };

  return (
    <div className="p-5">
      <div className="my-2">
        {jobCategorySelected && (
          <Button
            color="warning"
            variant="solid"
            isLoading={isClearingCache}
            disabled={isClearingCache}
            onClick={handleClearJobDetailsCache}
          >
            Clear Job Details Cache
          </Button>
        )}
      </div>
      <Dropdown isDisabled={isLoading}>
        <DropdownTrigger>
          <Button className="w-full" variant="bordered">
            {jobCategorySelectedLabel || "Select Job Category"}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          className="h-[300px] overflow-auto scrollbar-hide py-5 w-full"
          aria-label="Dynamic Actions"
          items={
            categoryListDetails?.categories ?? categoryListDetails?.data ?? []
          }
          onAction={handleAction}
        >
          {(item: any) => (
            <DropdownItem
              className={`w-full ${
                jobCategorySelected === item?.key
                  ? "bg-blue-500 text-white"
                  : ""
              }`}
              key={item?.key}
            >
              {item?.label}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
      {/* <Divider className="my-8" /> */}
      {data && data.data.length > 0 ? (
        <JobTable
          data={data}
          setPage={setPage}
          page={page}
          jobCategorySelected={jobCategorySelected}
        />
      ) : (
        <div>
          <NoContentFound />
        </div>
      )}
    </div>
  );
};

export default ListLanding;
