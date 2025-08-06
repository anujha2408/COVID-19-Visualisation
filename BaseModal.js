import { forwardRef } from "react";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import { Score } from "../AllPCAForms/Manager/TableData";
import { IoMdClose } from "react-icons/io";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { IoChevronDown } from "react-icons/io5";
import Badges from "../Misc/Badges";
import { formatFancyDate, getPCAElementVisibility,convertRange } from "../../utils";
import Select from '@mui/material/Select';
import { useState } from "react";
import MenuItem from '@mui/material/MenuItem';
import { useSelector, useDispatch } from "react-redux";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const InfoTitle = ({
  title,
  setOpen,
  subTitle = "",
  showCloseButton = false,
  className = "",
  style = {},
}) => {
  return (
    <div
      className={`container-fluid d-flex justify-content-between px-3 py-4 mb-2 ${className}`}
      style={{ ...style, position: "relative" }}
    >
      <div className="d-flex flex-column gap-2">
        <h3>
          <strong>{title}</strong>
        </h3>
        <small className="text-muted" style={{ marginTop: "-10px" }}>
          {subTitle}
        </small>
      </div>

      {showCloseButton && (
        <IoMdClose
          onClick={() => {
            setOpen(false);
          }}
        />
      )}
    </div>
  );
};

export const CommonPCATitle = ({
  name,
  quarterName,
  startDate,
  endDate,
  pcaScore,
  setOpen,
  showCloseButton = false,
  className = "",
  style = {},
  showScore,
  handleExpandAll
}) => {
  console.log("Datee", startDate,endDate);
  const output = convertRange(startDate+" "+endDate);

  return (
    <div
      className={`container-fluid d-flex justify-content-between px-3 py-4 mb-2 ${className}`}
      style={{ ...style, position: "relative" }}
    >
      <div className="d-flex flex-column gap-2">
        <h3>
          <strong>Quarter {quarterName}</strong>
        </h3>
        <small className="text-muted" style={{ marginTop: "-10px" }}>
          {output}
        </small>
      </div>

     <div className="d-flex flex-column align-items-end gap-2 text-end">
  <h3>
    <strong>{name}</strong>
  </h3>

  {showScore && (
    <small className="d-flex gap-2 align-items-center text-muted">
      PCA Score:
      <Score score={pcaScore || "N/A"} showTotal={false} />
    </small>
  )}

  <button onClick={handleExpandAll} className="btn btn-outline-primary btn-sm">
    Expand All
  </button>
</div>

      {showCloseButton && (
        <IoMdClose
          className="close-btn"
          onClick={() => {
            setOpen(false);
          }}
        />
      )}
    </div>
  );
};
export const PCAInfoTiles = ({
  title,
  value,
  children,
  editing = false,
  type = "default",
  className = "",
  style = {},
  showTitle = true,
}) => {
  return (
    <span
      className={`d-flex flex-column gap-1 align-items-center align-content-center ${className}`}
      style={style}
    >
      {showTitle && (
        <small
          className={`tag-label ${
            title === "blank" ? "text-white" : "text-muted"
          }`}
        >
          {title}
        </small>
      )}

      {!editing && <Badges badgeType={type} text={value} hoverText={title} />}
      {children}
    </span>
  );
};

export const ReadOnlyPCATile = ({
  goal,
  priority,
  weight,
  rating,
  dueDate,
  isActive,
  comments = "",
  className = "",
  style = {},
}) => {
  return (
    <div
      className={`contanier-fluid custom-card p-3 d-flex flex-column align-items-center ${className}`}
      style={style}
    >
      <div className="container-fluid py-2 d-flex justify-content-between align-items-center border-bottom">
        <div
          style={{
            fontWeight: "bold",
            width: "70%",
            overflowWrap: "break-word",
          }}
        >
          {goal}
        </div>
        <div className="d-flex">
          <PCAInfoTiles title={"weight"} value={weight} />
          <PCAInfoTiles title={"rating"} value={rating} type="success" />
          <PCAInfoTiles title={"due"} value={dueDate} type="warning" />
          <PCAInfoTiles
            title={"blank"}
            value={isActive ? "Active" : "Inactive"}
            type={isActive ? "success" : "fail"}
          />
        </div>
      </div>
      <div
        className="container-fluid py-2"
        style={{
          textAlign: "start",
          width: "100%",
          overflowWrap: "break-word",
        }}
      >
        <span className={`smaller ${comments ? "text-muted" : "text-danger"}`}>
          {comments || "No comments shared!"}
        </span>
      </div>
    </div>
  );
};

//TODO: Refactor the inputs to be taken as props
export const EditablePCATile = ({
  parentItem,
  goalIndex,
  goal,
  priority,
  weight,
  rating,
  dueDate,
  isActive,
  handleOnChange,
  userStatus,
  managerActionStatus,
  showComments = false,
  comments = "",
  className = "",
  style = {},
  showPriority = true,
  
}) => {
  const visibilityMap = getPCAElementVisibility(
    managerActionStatus,
    userStatus
  );
//  console.log("Visibility Map", visibilityMap, managerActionStatus,
//     userStatus);
 return (
  <div
    className={`container-fluid p-3 mb-3 shadow-sm rounded-4 ${className}`}
    style={{
      border: "1px solid #e0e0e0",
      backgroundColor: "#ffffff",
      ...style,
    }}
  >
    <div
      className={`container-fluid py-2 d-flex justify-content-between align-items-start flex-wrap ${
        showComments ? "border-bottom pb-3 mb-3" : ""
      }`}
    >
      {/* GOAL TEXTAREA */}
      <div style={{ flex: "1", minWidth: "300px", paddingRight: "1rem" }}>
        <textarea
          rows={3}
          className="form-control rounded-3 shadow-sm"
          placeholder="Enter your goal here..."
          id="goal"
          name="goal"
          value={goal || ""}
          onChange={(e) => handleOnChange(parentItem, goalIndex, e)}
          disabled={!visibilityMap["goal"]}
        />
      </div>

      {/* RIGHT SIDE INPUTS */}
      <div className="d-flex gap-3 flex-wrap justify-content-end">
        <PCAInfoTiles editing title={"Weight"}>
          <input
            type="number"
            className="form-control rounded-3 text-center"
            value={weight || ""}
            style={{ width: "4rem" }}
            id="weight"
            name="weight"
            onChange={(e) => handleOnChange(parentItem, goalIndex, e)}
            disabled={!visibilityMap["weight"]}
          />
        </PCAInfoTiles>
{visibilityMap["showRating"] && (
        <PCAInfoTiles editing title={"Rating"}>
          <select
            className="form-select rounded-3 text-center"
            name="rating"
            id="rating"
            value={rating || ""}
            style={{ width: "5rem" }}
            onChange={(e) => handleOnChange(parentItem, goalIndex, e)}
            disabled={!visibilityMap["rating"]}
          >
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </PCAInfoTiles>)
}
        <PCAInfoTiles editing title={"Due Date"}>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className="form-control rounded-3 text-center"
            value={dueDate || ""}
            onChange={(e) => handleOnChange(parentItem, goalIndex, e)}
            disabled={!visibilityMap["dueDate"]}
            style={{ width: "10rem" }}
          />
        </PCAInfoTiles>
      </div>
    </div>

    {/* COMMENTS SECTION */}
    {visibilityMap["showComments"] && (
      <div className="container-fluid">
        <label htmlFor="comments" className="form-label fw-semibold text-muted">
          Comments
        </label>
        <textarea
          rows={3}
          id="comments"
          name="comments"
          className="form-control rounded-3 shadow-sm"
          placeholder="Enter your comments here..."
          value={comments || ""}
          onChange={(e) => handleOnChange(parentItem, goalIndex, e)}
          disabled={!visibilityMap["comments"]}
        />
      </div>
    )}
  </div>
);
}


export const PCACommonAccordion = ({
  accordionTitle,
  accordionSubtitle,
  children,
  sideBorderColor = "",
  className = "",
  style = {},
  priority = null,
  onPriorityChange = () => {},
  pcaStatus,
  expanded = false,
  onToggle = () => {} // ← Add onToggle handler
}) => {
  console.log("userStatus", pcaStatus);
  const isEditable =
  pcaStatus === "Define your quarterly goals." ||
  pcaStatus === "Goals rejected. Please update your goals.";

  return (
    <Accordion 
      expanded={expanded} 
      onChange={(event, isExpanded) => onToggle(isExpanded)}
      className={className} 
      style={style}
    >
      <AccordionSummary
        expandIcon={
          <div style={{ cursor: "pointer", display: "flex" }}>
            <IoChevronDown />
          </div>
        }
        aria-controls="panel2-content"
        id="panel2-header"
      >
        <div className="container-fluid d-flex justify-content-between align-items-center w-100">
          <div className="d-flex gap-2 align-items-center">
            {sideBorderColor ? (
              <div className="section-icon" style={{ background: sideBorderColor }} />
            ) : (
              <div className={`section-icon ${accordionTitle?.toLowerCase()}-icon`} />
            )}

            <div className="d-flex flex-column">
              <strong>{accordionTitle}</strong>
              <small className="smaller text-muted">{accordionSubtitle}</small>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
          {isEditable ? (
            <PCAInfoTiles title="priority" showTitle={false}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <label
                  htmlFor="priority-select"
                  style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}
                >
                  PRIORITY
                </label>
                <Select
                  value={priority}
                  onChange={onPriorityChange}
                  size="small"
                  sx={{
                    width: 70,
                    fontSize: 13,
                    borderRadius: "20px",
                    border: "2px solid black",
                    backgroundColor: "#f1f1f1",
                    '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                    pointerEvents: "auto",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </PCAInfoTiles>
          ) : (
            <PCAInfoTiles
              title={"priority"}
              value={priority}
              type="highlight"
              showTitle={false}
            />
          )}
        </div>

        </div>
      </AccordionSummary>

      <AccordionDetails className="gap-3 d-flex flex-column">
        {children}
      </AccordionDetails>
    </Accordion>
  );
};


export const CommonPCAActionFooter = ({
    handleOnClick,
    text = "Submit",
    className = "gradient-button",
    disabled = false,
    loading = false,
}) => {
    return (
        <div className="border-top container-fluid d-flex justify-content-end align-items center p-3">
            <button
                className={className}
                onClick={handleOnClick}
                disabled={disabled || loading}
            >
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                {text}
            </button>
        </div>
    );
};

const BaseModal = ({
  open,
  setOpen,
  children,
  className = "",
  style = {},
  maxWidth = "lg",
}) => {
  return (
    <Dialog
      open={open}
      slots={{
        transition: Transition,
      }}
      keepMounted
      onClose={() => {
        setOpen(false);
      }}
      aria-describedby="base-dialog-box"
      fullWidth
      maxWidth={maxWidth} // Or any other size you prefer
      className={className}
      sx={{ ...style }}
    >
      {children}
    </Dialog>
  );
};

export default BaseModal;