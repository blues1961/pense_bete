import ItemCollectionView from "../components/ItemCollectionView";


function currentDayKey() {
  const now = new Date();
  const pad = (part) => String(part).padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}


function filterTodayItems(items) {
  const todayKey = currentDayKey();
  const todayEnd = new Date(`${todayKey}T23:59:59`);

  return items.filter((item) => {
    if (item.status === "done" || item.status === "archived") {
      return false;
    }

    if (item.due_date === todayKey) {
      return true;
    }

    if (!item.review_at) {
      return false;
    }

    return new Date(item.review_at) <= todayEnd;
  });
}


export default function TodayPage() {
  return (
    <ItemCollectionView
      description="Ce qui doit rester dans l’attention aujourd’hui: échéances du jour et revues arrivées."
      emptyMessage="Aucun item à revoir aujourd’hui."
      filterItems={filterTodayItems}
      title="Aujourd’hui"
    />
  );
}
