export type ListDataType = {
  createdAt: string;
  //   importantLink: [];
  jobCategory: string;
  postName: string;
  title: string;
  qualification: string;
  updatedAt: string;
  __v: 0;
  _id: string;
};

type Pagination = {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalJobs: number;
  totalPages: number;
};

export type ListData = {
  data: ListDataType[];
  pagination: Pagination;
};

export type CategoryListData = {
  categories: any[];
  totalPages: number;
};

type JobCategory = { key: string; label: string };

const jobCategory: JobCategory[] = [
  {
    key: "andhra-pradesh-government-jobs",
    label: "Andhra Pradesh Government Jobs",
  },
  {
    key: "arunachal-pradesh-government-jobs",
    label: "Arunachal Pradesh Government Jobs",
  },
  { key: "assam-government-jobs", label: "Assam Government Jobs" },
  { key: "bihar-government-jobs", label: "Bihar Government Jobs" },
  {
    key: "chhattisgarh-government-jobs",
    label: "Chhattisgarh Government Jobs",
  },
  { key: "goa-government-jobs", label: "Goa Government Jobs" },
  { key: "gujarat-government-jobs", label: "Gujarat Government Jobs" },
  { key: "haryana-government-jobs", label: "Haryana Government Jobs" },
  {
    key: "himachal-pradesh-government-jobs",
    label: "Himachal Pradesh Government Jobs",
  },
  { key: "jharkhand-government-jobs", label: "Jharkhand Government Jobs" },
  { key: "karnataka-government-jobs", label: "Karnataka Government Jobs" },
  { key: "kerala-government-jobs", label: "Kerala Government Jobs" },
  {
    key: "madhya-pradesh-government-jobs",
    label: "Madhya Pradesh Government Jobs",
  },
  { key: "maharashtra-government-jobs", label: "Maharashtra Government Jobs" },
  { key: "manipur-government-jobs", label: "Manipur Government Jobs" },
  { key: "meghalaya-government-jobs", label: "Meghalaya Government Jobs" },
  { key: "mizoram-government-jobs", label: "Mizoram Government Jobs" },
  { key: "nagaland-government-jobs", label: "Nagaland Government Jobs" },
  { key: "odisha-government-jobs", label: "Odisha Government Jobs" },
  { key: "punjab-government-jobs", label: "Punjab Government Jobs" },
  { key: "rajasthan-government-jobs", label: "Rajasthan Government Jobs" },
  { key: "sikkim-government-jobs", label: "Sikkim Government Jobs" },
  { key: "tamil-nadu-government-jobs", label: "Tamil Nadu Government Jobs" },
  { key: "telangana-government-jobs", label: "Telangana Government Jobs" },
  { key: "tripura-government-jobs", label: "Tripura Government Jobs" },
  {
    key: "uttar-pradesh-government-jobs",
    label: "Uttar Pradesh Government Jobs",
  },
  { key: "uttarakhand-government-jobs", label: "Uttarakhand Government Jobs" },
  { key: "west-bengal-government-jobs", label: "West Bengal Government Jobs" },
  {
    key: "andaman-and-nicobar-islands-government-jobs",
    label: "Andaman and Nicobar Islands Government Jobs",
  },
  { key: "chandigarh-government-jobs", label: "Chandigarh Government Jobs" },
  {
    key: "dadra-and-nagar-haveli-and-daman-and-diu-government-jobs",
    label: "Dadra and Nagar Haveli and Daman and Diu Government Jobs",
  },
  { key: "lakshadweep-government-jobs", label: "Lakshadweep Government Jobs" },
  { key: "delhi-government-jobs", label: "Delhi Government Jobs" },
  { key: "puducherry-government-jobs", label: "Puducherry Government Jobs" },
  { key: "ladakh-government-jobs", label: "Ladakh Government Jobs" },
  {
    key: "jammu-and-kashmir-government-jobs",
    label: "Jammu and Kashmir Government Jobs",
  },
];

export default jobCategory;

export const isProdEnviroment = () =>
  process.env.NEXT_PUBLIC_NODE === "production";

export const productCategoryMapping: Record<string, string> = {
  yarn: "Yarn",
  garments: "Garments",
  "home-decoration": "Home Decoration",
  "textile-farming": "Textile Farming",
  fibre: "Fibre",
  "greige-fabric": "Greige Fabric",
  denim: "Denim",
  "finished-fabrics": "Finished Fabrics",
  "trims-accessories": "Trims & Accessories",
  packing: "Packing",
  "dyes-chemicals": "Dyes & Chemicals",
  machineries: "Machineries & Equipment",
};
