function ArticleTags({ tagList = [] }) {
  return (
    Array.isArray(tagList) && tagList.length > 0 && (
      <ul className="tag-list">
        {tagList.map((tag) => (
          <li key={tag} className="tag-default tag-pill tag-outline">
            {tag}
          </li>
        ))}
      </ul>
    )
  );
}

export default ArticleTags;
