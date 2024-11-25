export default function Avatar({ image }) {
  return (
    <div className='avatar'>
      <img src={image} alt={image} />
    </div>
  );
}
