export default function CardContent({ name, role, licenseId, description }) {
  return (
    <div className='content'>
      <h1>{name}</h1>
      <p>{role}</p>
      <small>License ID - {licenseId}</small>
      <p>{description}</p>
    </div>
  );
}
