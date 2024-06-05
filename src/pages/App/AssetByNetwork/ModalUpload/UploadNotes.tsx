import { BiLinkExternal } from "@react-icons/all-files/bi/BiLinkExternal";
import React from "react";
import { NETWORK_CODES } from "../../../../constants/constants";
import { MINTEGRAL_ASSET_DIMENSIONS } from "../../../../constants/asset";

function UploadNotes(props) {
  const { networkCode } = props;
  let listDimentions: string[] = [];
  let refLink;

  switch (networkCode) {
    case NETWORK_CODES.mintegral:
      listDimentions = MINTEGRAL_ASSET_DIMENSIONS;
      refLink = "https://adv-new.mintegral.com/doc/en/appendix/creative";
      break;

    default:
      break;
  }

  let noteContent;
  if (listDimentions?.length) {
    noteContent = (
      <div className="mt-0.5">
        <span className="font-bold mr-0.5">Pixel/Dimension:</span>
        <span>{listDimentions.join(", ")}</span>
        {refLink && (
          <span className="ml-0.5 whitespace-nowrap">
            {"("}
            <a
              href={refLink}
              className="cursor-pointer inline-block"
              target="_blank"
            >
              <div className="flex items-center">
                View detail
                <BiLinkExternal size={14} className="ml-0.5" />
              </div>
            </a>
            {")"}
          </span>
        )}
      </div>
    );
  }
  if (networkCode === NETWORK_CODES.unity) {
    noteContent = (
      <ul className="list-disc mt-0.5 pl-6">
        <li>Square end card: a single square shaped 800 x 800 image.</li>
        <li>
          End card pair: a 600 x 800 portrait image and a 800 x 600 landscape
          image.
        </li>
        <li>
          Video: contains either a 9:16 portrait video or a 16:9 landscape
          video.
        </li>
        <li>
          Playable: contains an MRAID 2.0 compliant HTML document in a portrait,
          landscape or responsive orientation.
        </li>
      </ul>
    );
  }

  return (
    <>
      {noteContent && (
        <div className="mb-3">
          <div className="flex items-center text-sm2 -mt-1">
            <span className="font-bold mr-0.5">Note: </span> Please make sure to
            select the correct assets format before submitting it to the
            network.
          </div>
          {noteContent}
        </div>
      )}
    </>
  );
}

export default UploadNotes;
