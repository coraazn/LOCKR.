
import './Terms.css'

export default function Terms() {
  return (
    <main className="terms-page">
      <header className="terms-header">
        <a className="terms-brand" href="/">LOCKR<span>.</span></a>
        <a className="terms-back" href="/">Retour au site</a>
      </header>

      <article className="terms-content">
        <p className="terms-eyebrow">LOCKR · DOCUMENT LÉGAL</p>
        <h1>Conditions d’utilisation</h1>
        <p className="terms-updated">Dernière mise à jour : 21 octobre 2026</p>

        <p>
          Bienvenue sur LOCKR, un projet indépendant permettant aux joueurs
          de Fortnite de consulter des objets cosmétiques et de gérer leur casier.
          En utilisant le site ou le bot Discord LOCKR, vous acceptez les
          présentes conditions.
        </p>

        <section>
          <h2>1. Présentation du service</h2>
          <p>
            LOCKR propose des fonctionnalités de consultation, de suivi de
            cosmétiques, de gestion de casiers, de classement et des commandes
            Discord. Les fonctionnalités peuvent évoluer ou être supprimées.
          </p>
        </section>

        <section>
          <h2>2. Indépendance</h2>
          <p>
            LOCKR est un projet indépendant et n’est ni affilié à, ni approuvé
            par Epic Games ou Discord. Fortnite et les marques associées
            appartiennent à leurs propriétaires respectifs.
          </p>
        </section>

        <section>
          <h2>3. Comptes et sécurité</h2>
          <p>
            Vous êtes responsable de la sécurité de votre compte et des actions
            réalisées depuis celui-ci. Vous devez fournir des informations
            exactes et ne pas usurper l’identité d’une autre personne.
          </p>
        </section>

        <section>
          <h2>4. Utilisation autorisée</h2>
          <p>Il est interdit de :</p>
          <ul>
            <li>Utiliser LOCKR pour harceler, menacer ou tromper d’autres personnes.</li>
            <li>Exploiter une faille, perturber le service ou contourner ses protections.</li>
            <li>Envoyer du spam ou tenter d’accéder aux données d’autres utilisateurs.</li>
            <li>Utiliser le service pour enfreindre la loi ou les règles des plateformes concernées.</li>
          </ul>
        </section>

        <section>
          <h2>5. Classements et casiers</h2>
          <p>
            Les informations de casier, scores et classements sont fournis à
            titre informatif. Ils peuvent être incomplets, inexacts ou modifiés.
            Un score LOCKR ne constitue pas une estimation officielle ou garantie
            de la valeur financière d’un compte ou d’un objet.
          </p>
        </section>

        <section>
          <h2>6. Bot Discord et modération</h2>
          <p>
            Les commandes du bot dépendent des autorisations accordées par les
            administrateurs du serveur. Les outils de modération doivent être
            utilisés de manière responsable et conformément aux règles de Discord.
            Les administrateurs restent responsables de la configuration de leur serveur.
          </p>
        </section>

        <section>
          <h2>7. Propriété intellectuelle</h2>
          <p>
            Le nom, le code et les éléments originaux de LOCKR restent soumis
            aux droits de leurs titulaires respectifs. Les contenus appartenant
            à des tiers restent la propriété de leurs propriétaires.
            Toute réutilisation du contenu original de LOCKR nécessite une
            autorisation lorsque la loi l’exige.
          </p>
        </section>

        <section>
          <h2>8. Disponibilité et responsabilité</h2>
          <p>
            Le service est fourni selon sa disponibilité, sans garantie
            d’absence d’interruption ou d’erreur. Dans les limites permises
            par la loi, LOCKR ne garantit pas l’exactitude permanente des données.
            Rien dans ces conditions ne limite les droits que la loi ne permet
            pas d’exclure.
          </p>
        </section>

        <section>
          <h2>9. Suspension</h2>
          <p>
            L’accès peut être limité ou suspendu en cas d’abus, de risque pour
            le service ou de violation de ces conditions, dans le respect du
            droit applicable.
          </p>
        </section>

        <section>
          <h2>10. Données personnelles</h2>
          <p>
            Les données personnelles doivent être traitées conformément au droit
            applicable. Avant la mise en service, consultez la politique de
            confidentialité de LOCKR pour connaître les données collectées,
            leurs finalités, leur durée de conservation et les moyens de contact.
          </p>
        </section>

        <section>
          <h2>11. Modifications</h2>
          <p>
            Ces conditions peuvent être mises à jour. La date figurant en haut
            de cette page indique la dernière révision publiée.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            Pour toute question concernant ces conditions, contactez le responsable
            du projet à l’adresse suivante : <strong>[adresse e-mail à compléter]</strong>.
          </p>
        </section>

        <footer className="terms-footer">
          <span>LOCKR<span className="terms-dot">.</span></span>
          <a href="/">Retour à LOCKR</a>
        </footer>
      </article>
    </main>
  )
}
