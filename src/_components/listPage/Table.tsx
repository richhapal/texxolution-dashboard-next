import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  getKeyValue,
  Button,
} from "@nextui-org/react";
import { PencilSquareIcon, EyeIcon } from "@heroicons/react/24/outline"; // Import icons for Edit and Preview

import {
  ListData,
  ListDataType,
  isProdEnviroment,
} from "../../_lib/utils/utils";
import { useLazyGetClearJobDetailsCacheQuery } from "@/_lib/rtkQuery/listRtkQuery";

export default function JobTable({
  data,
  setPage,
  page,
  jobCategorySelected,
}: {
  data: ListData;
  setPage: (n: number) => void;
  page: number;
  jobCategorySelected: string;
}) {
  // const rowsPerPage = 10;
  const totalPage = data.pagination.totalPages;

  const [clearJobDetailsCache, { isLoading }] =
    useLazyGetClearJobDetailsCacheQuery({});

  const handleClearJobDetailsCache = async (
    jobCategory: string,
    postName: string
  ) => {
    try {
      await clearJobDetailsCache({ jobCategory, postName });
    } catch (err) {
      console.error("Error clearing cache of job details:", err);
    }
  };

  const handleRenderCell = (item: any, columnKey: string) => {
    const value = getKeyValue(item, columnKey);
    const isProd = isProdEnviroment();
    const previewurl = isProd
      ? "https://www.freejobalert.com"
      : "https://www.stage.freejobalert.com";

    if (columnKey === "url") {
      return (
        <div>
          <div className="flex space-x-2 mt-2">
            <a
              href={`/dashboard/edit/${jobCategorySelected}/${item.url}`}
              className="text-gray-600"
            >
              <PencilSquareIcon className="w-5 h-5 hover:text-blue-600" />
            </a>
            <a
              href={`${previewurl}/${jobCategorySelected}/${item.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600"
            >
              <EyeIcon className="w-5 h-5 hover:text-blue-600" />
            </a>
            <Button
              disabled={isLoading}
              isLoading={isLoading}
              size="sm"
              variant="ghost"
              onClick={() => {
                handleClearJobDetailsCache(item?.jobCategory, item?.url);
              }}
            >
              {" "}
              Clear Cache
            </Button>
          </div>
        </div>
      );
    }

    return value;
  };

  return (
    <Table
      aria-label="Job Table with Pagination"
      bottomContent={
        <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="secondary"
            page={page}
            total={totalPage}
            onChange={(page) => setPage(page)}
          />
        </div>
      }
      classNames={{
        wrapper: "min-h-[222px] mt-10",
      }}
    >
      <TableHeader>
        {/* <TableColumn key="sno">S.No</TableColumn> */}
        <TableColumn key="postName">Post Name</TableColumn>
        <TableColumn key="title">Post Title</TableColumn>
        <TableColumn key="url">ACTION</TableColumn>
      </TableHeader>
      <TableBody items={data.data}>
        {(item: ListDataType) => (
          <TableRow key={item._id}>
            {(columnKey) => (
              <TableCell>
                {handleRenderCell(item, columnKey as string)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
