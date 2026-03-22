import ItemCollectionView from "../components/ItemCollectionView";


function currentDayBounds() {
  const now = new Date();
  const pad = (part) => String(part).padStart(2, "0");
  const dayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  return {
    dayKey,
    dayEnd: new Date(`${dayKey}T23:59:59`),
  };
}


function filterUpcomingItems(items) {
  const { dayEnd, dayKey } = currentDayBounds();

  return items.filter((item) => {
    if (item.status === "done" || item.status === "archived") {
      return false;
    }

    if (item.due_date && item.due_date > dayKey) {
      return true;
    }

    if (!item.review_at) {
      return false;
    }

    return new Date(item.review_at) > dayEnd;
  });
}


export default function UpcomingPage() {
  return (
    <ItemCollectionView
      description="Échéances et révisions futures, pour voir ce qui s’en vient sans le mélanger à l’attention du jour."
      emptyMessage="Aucun item à venir."
      filterItems={filterUpcomingItems}
      title="À venir"
    />
  );
}
