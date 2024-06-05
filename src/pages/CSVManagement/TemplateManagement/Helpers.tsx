export const downloadCSV = (res) => {
  if (res.data) {
    const href = URL.createObjectURL(
      new Blob([res.data], { type: "application/zip" })
    );
    const link = document.createElement("a");
    const filename = res.headers["content-disposition"]
      .split("filename=")[1]
      .split(".")[0];

    link.href = href;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();

    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  }
};
