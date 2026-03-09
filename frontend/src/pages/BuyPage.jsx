import ItemCollectionView from "../components/ItemCollectionView";


function filterBuyItems(items) {
  return items.filter(
    (item) => item.kind === "buy" && item.status !== "done" && item.status !== "archived",
  );
}


export default function BuyPage() {
  return (
    <ItemCollectionView
      description="Achats actifs à suivre sans les noyer dans le reste."
      emptyMessage="Aucun achat actif."
      filterItems={filterBuyItems}
      title="Achats"
    />
  );
}
