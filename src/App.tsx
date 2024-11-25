import Card from './components/Card.jsx';

export default function App() {
  const persons = [
    {
      name: 'Zun',
      role: 'Student',
      licenseId: '123456',
      description: 'He is a student',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWRuoG36ngJAbr1IMtceFKFgcGbC8S1eUkpw&s',
    },
    {
      name: 'Zubby',
      role: 'Student',
      licenseId: '123457',
      description: 'He is a students',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWRuoG36ngJAbr1IMtceFKFgcGbC8S1eUkpw&s',
    },
    {
      name: 'Zunny',
      role: 'Student',
      licenseId: '1234567',
      description: 'He is a studentssss',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWRuoG36ngJAbr1IMtceFKFgcGbC8S1eUkpw&s',
    },
  ];
  return (
    <div>
      {persons.map((person) => (
        <Card person={person} />
      ))}
    </div>
  );
}
