import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Card>
      <CardMedia
        component='img'
        height='200'
        image={book.thumbnail || '/placeholder-book.jpg'}
        alt={book.title}
      />
      <CardContent>
        <Typography variant='h6' noWrap>
          {book.title}
        </Typography>
        <Typography variant='body2' color='text.secondary' noWrap>
          {book.authors?.join(', ')}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          ⭐ {book.average_rating.toFixed(1)} ({book.ratings_count})
        </Typography>
      </CardContent>
    </Card>
  );
}
