/** Original CSS implementation, visually informed by the 21st.dev orb collection.
 * Decorative only: never records audio or implies an active voice connection.
 */
export default function VoiceOrb({ paused }: { paused: boolean }) {
  return (
    <div className={`orb-scene ${paused ? 'is-paused' : ''}`} aria-hidden="true">
      <div className="orb-halo" />
      <div className="orb-ring orb-ring-outer" />
      <div className="orb-ring orb-ring-inner" />
      <div className="voice-orb"><div className="orb-cloud orb-cloud-one" /><div className="orb-cloud orb-cloud-two" /><div className="orb-sheen" /></div>
      <span className="orb-star star-one" /><span className="orb-star star-two" /><span className="orb-star star-three" />
    </div>
  )
}
