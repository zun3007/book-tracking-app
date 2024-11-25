import Avatar from './Avatar';
import CardContent from './CardContent';

export default function Card({ person }) {
  const { name, role, licenseId, description, image } = person;

  return (
    <div className='card'>
      <Avatar image={image} />
      <CardContent
        name={name}
        description={description}
        licenseId={licenseId}
        role={role}
      />
    </div>
  );
}
