import ItemCollectionView from "../components/ItemCollectionView";


function filterInboxItems(items) {
  return items.filter((item) => item.status === "inbox");
}


export default function InboxPage() {
  return (
    <ItemCollectionView
      description="Capture brute et tri différé. C’est le point d’entrée principal du flux."
      emptyMessage="L’Inbox est vide."
      filterItems={filterInboxItems}
      title="Inbox"
    />
  );
}
