import { useState, useEffect } from "react";
import BaseModal, {
  CommonPCAActionFooter,
  CommonPCATitle,
  EditablePCATile,
  PCACommonAccordion,
} from "./BaseModal";
import "./index.css";
import Spacer from "../Misc/Spaces";
import CustomLoader from "../Misc/CustomLoader";
import { untransformPCAData } from "../../utils";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { updateForm, fetchProfile } from "../../store/actions";
import moment from "moment";
import { submitForm } from "../../store/submitformAction";

const EditableForm = ({ data, open, setOpen, loading, rawData, pcaStatus, pcaScore, role }) => {
  const [formDataItems, setFormDataItems] = useState([]);
  const [editableFormData, setEditableFormData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    passion: false,
    contribution: false,
    attitude: false
  });
  const userData = useSelector((state) => state.profile?.profile?.userdata);
  const dispatch = useDispatch();

  const handleExpandAll = () => {
    setExpandedSections({
      passion: true,
      contribution: true,
      attitude: true
    });
  };

  // Handle individual accordion toggle
  const handleAccordionToggle = (sectionKey, isExpanded) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: isExpanded
    }));
  };

  useEffect(() => {
    if (loading) return;
    try {
      const pcaHeaders = Object.keys(data?.pcaFormData);
      if (pcaHeaders?.length) {
        const updatedFormData = { ...data?.pcaFormData };

        pcaHeaders.forEach((section) => {
          if (!updatedFormData[section].goals || updatedFormData[section].goals.length === 0) {
            updatedFormData[section].goals = [
              { goal: "", priority: 1, weight: 0, rating: 0, dueDate: "", isActive: false, comments: "" },
              { goal: "", priority: 2, weight: 0, rating: 0, dueDate: "", isActive: false, comments: "" },
              { goal: "", priority: 3, weight: 0, rating: 0, dueDate: "", isActive: false, comments: "" },
            ];
          }
        });

        setFormDataItems(pcaHeaders);
        setEditableFormData(updatedFormData);
      }
    } catch (e) {
      console.log(e);
      setFormDataItems(["passion", "contribution", "attitude"]);
    }
  }, [loading]);

  const handleSectionPriorityChange = (sectionKey, e) => {
    const updated = { ...editableFormData };
    updated[sectionKey].priority = parseInt(e.target.value);
    setEditableFormData(updated);
  };

  const handleOnChange = (changeFor, goalIndex, e) => {
    const temp = { ...editableFormData };
    temp[changeFor]["goals"][goalIndex][e.target.id] = e.target.value;
    setEditableFormData(temp);
  };

  const handleSubmit = () => {
    const isDDMMYYYY = (dateStr) => /^\d{2}-\d{2}-\d{4}$/.test(dateStr);

    const quarterstartdate = isDDMMYYYY(rawData?.quarterstartdate)
      ? rawData?.quarterstartdate
      : moment(rawData?.quarterstartdate, "MM-DD-YYYY").format("DD-MM-YYYY");

    const quarterenddate = isDDMMYYYY(rawData?.quarterenddate)
      ? rawData?.quarterenddate
      : moment(rawData?.quarterenddate, "MM-DD-YYYY").format("DD-MM-YYYY");

    const apiData = {
      id: rawData?.id,
      uid: userData?.uid,
      name: userData?.name,
      email: userData?.email,
      manager_email: userData?.manager_email,
      reviewer_email: userData?.reviewer_email,
      quarterstartdate,
      quarterenddate,
      quartername: rawData?.quartername,
      message: "submit pca formdata",
      user_status: "submitted",
      manager_action_status: "pending",
      reviewer_action_status: "pending",
      type: "EMPLOYEE",
      manager_name: userData?.manager_name,
      reviewer_name: userData?.reviewer_name,
      ...untransformPCAData(editableFormData),
    };

    const smartGoals = apiData?.smart_goals;
    const attitudeGoals = apiData?.attitude_goals;
    const contributionGoals = apiData?.contribution_goals;

    if (!smartGoals || !attitudeGoals || !contributionGoals) {
      return toast.error("One or more goal sections are missing from the data.");
    }

    smartGoals.priority_theam = !smartGoals.priority_theam || smartGoals.priority_theam === "0" ? "1" : smartGoals.priority_theam;
    attitudeGoals.priority_theam = !attitudeGoals.priority_theam || attitudeGoals.priority_theam === "0" ? "2" : attitudeGoals.priority_theam;
    contributionGoals.priority_theam = !contributionGoals.priority_theam || contributionGoals.priority_theam === "0" ? "1" : contributionGoals.priority_theam;

    const overallPriority =
      Number(smartGoals.priority_theam || 0) +
      Number(attitudeGoals.priority_theam || 0) +
      Number(contributionGoals.priority_theam || 0);

    if (overallPriority > 5 || overallPriority < 1) {
      return toast.error("Priority of all sections must add up to a maximum of 5.");
    }

    const countFilledGoals = (goals, prefix) =>
      Object.entries(goals).filter(([key, goal]) =>
        key.startsWith(prefix) &&
        (goal.is_active === "true" || goal.is_active === true) &&
        goal.goal?.toString().trim().length > 0 &&
        goal.assign_date?.toString().trim().length > 0 &&
        !isNaN(Number(goal.weight)) &&
        Number(goal.weight) > 0
      ).length;

    const isWeightValid = (goals, prefix) => {
      let total = 0;
      for (const [key, goal] of Object.entries(goals)) {
        if (key.startsWith(prefix) && goal.is_active === "true") {
          const weight = parseFloat(goal.weight || "0");
          total += isNaN(weight) ? 0 : weight;
        }
      }
      return total === 100;
    };

    const validateGoals = (section, prefix, minRequired, label) => {
      const filled = countFilledGoals(section, prefix);
      if (filled < minRequired) {
        throw new Error(`Please fill at least ${minRequired} ${label} goals.`);
      }
      if (!isWeightValid(section, prefix)) {
        throw new Error(`Total ${label} weight must be 100.`);
      }
    };

    try {
      if (Number(smartGoals.priority_theam) > 0) validateGoals(smartGoals, "smart_goal_", 2, "Passion");
      if (Number(contributionGoals.priority_theam) > 0) validateGoals(contributionGoals, "contribution_goal_", 1, "Contribution");
      if (Number(attitudeGoals.priority_theam) > 0) validateGoals(attitudeGoals, "attitude_goal_", 2, "Attitude");
    } catch (err) {
      return toast.error(err.message);
    }

    const finalPayload = {
      ...apiData,
      smart_goals: smartGoals,
      attitude_goals: attitudeGoals,
      contribution_goals: contributionGoals,
      user_status: "submitted",
      message: "submit pca formdata",
    };

    dispatch(updateForm(finalPayload));
    dispatch(submitForm(finalPayload));
    toast.success("Your PCA Form is submitted! successfully");
    setOpen(false);
    dispatch(fetchProfile());
  };

  return (
    <BaseModal open={open} setOpen={setOpen} style={{ padding: "4rem" }}>
      {loading ? (
        <CustomLoader />
      ) : (
        <div className="p-4">
          <CommonPCATitle
            name={data?.name}
            quarterName={data?.quarterName}
            startDate={data?.startDate}
            endDate={data?.endDate}
            pcaScore={pcaScore}
            setOpen={setOpen}
            showCloseButton={true}
            showScore={data?.pcaScore !== undefined && data?.pcaScore !== null && data?.pcaScore !== ""}
            handleExpandAll={handleExpandAll}
          />

          {formDataItems?.length > 0 &&
            formDataItems.map((item, index) => {
              const itemData = data?.pcaFormData[item];
              const goals = itemData?.goals;
              return (
                <PCACommonAccordion
                  key={index}
                  accordionTitle={itemData?.title}
                  accordionSubtitle={itemData?.subtitle}
                  className="gap-2"
                  priority={itemData?.priority}
                  onPriorityChange={(e) => handleSectionPriorityChange(item, e)}
                  pcaStatus={pcaStatus}
                  expanded={expandedSections[item]}
                  onToggle={(isExpanded) => handleAccordionToggle(item, isExpanded)} // ← Add toggle handler
                >
                  {[0, 1, 2].map((goalItem, goalIndex) => {
                    const temp = goals[goalIndex];
                    if (!temp) return null;

                    return (
                      <EditablePCATile
                        key={`${goalIndex}_${goalItem}`}
                        parentItem={item}
                        goalIndex={goalIndex}
                        goal={temp?.goal || null}
                        priority={temp?.priority || null}
                        weight={temp?.weight || null}
                        rating={temp?.rating || null}
                        dueDate={temp?.dueDate || null}
                        isActive={temp?.isActive || null}
                        comments={temp?.comments || null}
                        showPriority={false}
                        handleOnChange={handleOnChange}
                        userStatus={data?.userStatus}
                        managerActionStatus={data?.managerActionStatus}
                      />
                    );
                  })}
                </PCACommonAccordion>
              );
            })}

          <Spacer height={"2dvh"} />

          {(
            ["pending with employee", "checked"].includes(data?.userStatus) ||
            (data?.userStatus === "submitted" && data?.managerActionStatus === "pending" && role === "Manager")
          ) && (
            <CommonPCAActionFooter handleOnClick={handleSubmit} />
          )}
        </div>
      )}
    </BaseModal>
  );
};

export default EditableForm;