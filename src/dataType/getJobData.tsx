class ImportantLink {
  displayText: string;
  text: string;
  type: "Link" | "Text";
  value: string;
  constructor(data: any) {
    this.displayText = data?.displayText;
    this.text = data?.text;
    this.type = data?.type;
    this.value = data?.value;
  }
}

class JobDataType {
  applicationFeeDetails: string = "";
  isVacancyOver: boolean = false;
  importantLinks: ImportantLink[] = [];
  jobCategory: string = "";
  jobPublish: "listed" | "unlisted" = "listed";
  metaTags: string[] = [];
  postName: string = "";
  qualifications: string = "";
  title: string = "";
  vacancyDetails: string = "";

  constructor(data: any) {
    this.applicationFeeDetails = data?.applicationFeeDetails || "";
    this.isVacancyOver = data?.isVacancyOver || false;
    this.importantLinks = (data?.importantLinks || []).map(
      (link: any) => new ImportantLink(link)
    );
    this.jobCategory = data?.jobCategory || "";
    this.jobPublish = data?.jobPublish || "listed";
    this.metaTags = data?.metaTags || [];
    this.postName = data?.postName || "";
    this.qualifications = data?.qualifications || "";
    this.title = data?.title || "";
    this.vacancyDetails = data?.vacancyDetails || "";
  }

  // Convert JobData to FormValues
  toFormValues() {
    return {
      jobCategory: this.jobCategory,
      postName: this.postName,
      title: this.title,
      qualifications: this.qualifications,
      importantLinks: this.importantLinks.map((link: any) => ({
        displayText: link.displayText,
        type: link.type,
        value: link.value,
        text: link.text,
      })),
      applicationFeeDetails: this.applicationFeeDetails,
      vacancyDetails: this.vacancyDetails,
      metaTags: this.metaTags,
      jobPublish: this.jobPublish,
      isVacancyOver: this.isVacancyOver,
    };
  }

  // Populate JobData from FormValues
  static fromFormValues(formValues: any): JobDataType {
    return new JobDataType({
      ...formValues,
      importantLinks: formValues.importantLinks.map((link: any) => ({
        displayText: link.displayText,
        type: link.type,
        value: link.value,
        text: link.text,
      })),
    });
  }
}

export default JobDataType;
