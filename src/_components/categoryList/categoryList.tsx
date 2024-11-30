"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
} from "@nextui-org/react";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import {
  useGetAllCategoryListQuery,
  useAddNewCategoryMutation,
} from "@/_lib/rtkQuery/listRtkQuery";

type ListType = {
  _id: string;
  label: string;
  key: string;
};

export default function CategoryList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [list, setList] = useState<ListType[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [newLabel, setNewLabel] = useState("");
  const [newKey, setNewKey] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: categoryList, isLoading: isCategoryListLoading } =
    useGetAllCategoryListQuery({
      pageNo: page,
      pageSize: rowsPerPage,
    });

  const [addNewCategory, { isLoading }] = useAddNewCategoryMutation();

  useEffect(() => {
    if (categoryList) {
      console.log({ categoryList });
      const listData = categoryList?.categories?.map((item: any) => ({
        _id: item?._id,
        key: item?.key,
        label: item?.label,
      }));
      setTotalPage(categoryList?.totalPages);
      setList(listData);
    }
  }, [categoryList]);

  const handleLabelChange = (value: string) => {
    setNewLabel(value);
    setNewKey(value.toLowerCase().replace(/\s+/g, "-"));
  };

  const handleAddCategory = async () => {
    try {
      await addNewCategory({ body: { label: newLabel, key: newKey } }).unwrap();
      onClose();
      setNewLabel("");
      setNewKey("");
    } catch (error) {
      console.error("Failed to add new category:", error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Category List</h1>
        <div className="flex items-center space-x-2">
          <Button
            // auto
            color="primary"
            startContent={<PlusIcon className="h-5 w-5" />}
            onClick={onOpen}
          >
            Add Category
          </Button>
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                endContent={<ChevronDownIcon className="h-4 w-4" />}
              >
                {rowsPerPage} per page
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Page limit selection"
              onAction={(key) => setRowsPerPage(Number(key))}
            >
              {[1, 5, 10, 15].map((limit) => (
                <DropdownItem key={limit}>{limit} per page</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Add New Category</ModalHeader>
          <ModalBody>
            <Input
              label="Category Label"
              placeholder="Enter category label"
              value={newLabel}
              onChange={(e) => handleLabelChange(e.target.value)}
            />
            <Input
              label="Category Key"
              placeholder="Auto-generated key"
              value={newKey}
              readOnly
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleAddCategory}
              isLoading={isLoading}
            >
              Add Category
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Table
        aria-label="Example table with client-side pagination"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={totalPage}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>CATEGORY LABEL</TableColumn>
          <TableColumn>CATEGORY KEY</TableColumn>
        </TableHeader>
        <TableBody
          items={list}
          loadingContent={
            <div className="flex justify-center items-center h-40">
              Loading categories...
            </div>
          }
          loadingState={isCategoryListLoading ? "loading" : "idle"}
          emptyContent={
            <div className="flex justify-center items-center h-40">
              No categories found
            </div>
          }
        >
          {(item) => (
            <TableRow key={item._id}>
              <TableCell>{item.label}</TableCell>
              <TableCell>{item.key}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
