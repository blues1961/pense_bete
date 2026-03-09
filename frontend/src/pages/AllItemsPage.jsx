import ItemCollectionView from "../components/ItemCollectionView";


export default function AllItemsPage() {
  return (
    <ItemCollectionView
      description="Vue globale de tous les items personnels, quel que soit leur statut."
      emptyMessage="Aucun item pour le moment."
      title="Tous"
    />
  );
}
