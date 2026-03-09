import { useEffect, useState } from "react";

import { AuthError, getWhoAmI } from "../api";


export default function HomePage({ onAuthFailure }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    getWhoAmI()
      .then((payload) => {
        if (!active) {
          return;
        }

        setUser(payload);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        if (error instanceof AuthError) {
          onAuthFailure(error);
          return;
        }

        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [onAuthFailure]);

  return (
    <section className="grid">
      <article className="panel panel--hero">
        <p className="eyebrow">Lot 1</p>
        <h1>Socle protégé en place.</h1>
        <p className="lede">
          L’authentification JWT, la récupération du profil courant et la garde
          de route sont branchées. Le métier `Item` viendra dans le lot suivant.
        </p>
      </article>
      <article className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Session</p>
            <h2>Utilisateur courant</h2>
          </div>
          <span className={`badge badge--${status}`}>{status}</span>
        </div>
        {user ? (
          <dl className="details-list">
            <div>
              <dt>Identifiant</dt>
              <dd>{user.username}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email || "non renseigné"}</dd>
            </div>
            <div>
              <dt>Prénom</dt>
              <dd>{user.first_name || "non renseigné"}</dd>
            </div>
            <div>
              <dt>Nom</dt>
              <dd>{user.last_name || "non renseigné"}</dd>
            </div>
          </dl>
        ) : (
          <p className="muted">
            {status === "loading"
              ? "Chargement du profil courant."
              : "Le profil utilisateur n’a pas pu être récupéré."}
          </p>
        )}
      </article>
    </section>
  );
}
