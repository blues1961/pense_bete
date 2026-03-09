import ItemCollectionView from "../components/ItemCollectionView";


function filterWaitingItems(items) {
  return items.filter((item) => item.status === "waiting");
}


export default function WaitingPage() {
  return (
    <ItemCollectionView
      description="Dossiers et relances en attente, sans les perdre de vue."
      emptyMessage="Aucun item en attente."
      filterItems={filterWaitingItems}
      title="En attente"
    />
  );
}
