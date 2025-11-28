import { useFeedContext } from "../../context/FeedContext";

function TagButton({ tagsList = [] }) {
  const { changeTab } = useFeedContext();

  const handleClick = (e) => {
    changeTab(e, "tag");
  };

  if (!Array.isArray(tagsList)) return null;

  if (!Array.isArray(tagsList) || tagsList.length === 0) return null;

  return tagsList.slice(0, 50).map((name) => (
    <button className="tag-pill tag-default" key={name} onClick={handleClick}>
      {name}
    </button>
  ));
}

export default TagButton;
