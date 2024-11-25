import Avatar from './Avatar';
import Button from './Button';
import ButtonGroup from './ButtonGroup';
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
      <ButtonGroup>
        <Button content='Follow' />
        <Button content='Send Mail' />
        <Button content='Show Phone Number' />
      </ButtonGroup>
    </div>
  );
}
