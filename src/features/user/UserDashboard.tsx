import { useSpring, animated } from '@react-spring/web';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function UserDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const updateProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error fetching user:', userError);
        navigate('/login');
        return;
      }

      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (!profileData && profileError) {
          // Insert profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              email: user.email,
            });

          if (insertError) throw insertError;
        } else if (profileData) {
          // Update profile if it exists
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ email: user.email })
            .eq('user_id', user.id);

          if (updateError) throw updateError;
        }
      } else {
        navigate('/login');
      }
    };

    updateProfile().catch((error) => {
      toast.error('Failed to update profile. Please try again.');
      console.error(error);
    });
  }, [navigate]);

  const sectionAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 800 },
    delay: 200,
  });

  const cardAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { duration: 500 },
  });

  // Fetch data from Supabase
  const fetchRecommendations = async () => {
    const { data, error } = await supabase
      .from('recommendations')
      .select('book_id, reason, books (title, authors, thumbnail)')
      .limit(8);

    if (error) throw new Error(error.message);
    return data;
  };

  // React Query hooks
  const {
    data: recommendations,
    isLoading: loadingRecommendations,
    error: errorRecommendations,
  } = useQuery({
    queryKey: ['recommendations'],
    queryFn: fetchRecommendations,
  });

  return (
    <div className='bg-slate-50 min-h-screen text-slate-800 font-sans'>
      {/* Main Content */}
      <div className='pt-20 max-w-7xl mx-auto px-4'>
        {/* Recommendations Section */}
        <animated.section style={sectionAnimation} className='mt-10'>
          <h2 className='text-3xl font-bold mb-6'>Recommended for You</h2>
          {loadingRecommendations ? (
            <p className='text-slate-500'>Loading recommendations...</p>
          ) : errorRecommendations ? (
            <p className='text-red-500'>{errorRecommendations.message}</p>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {recommendations.map((rec, idx) => (
                <animated.div
                  key={idx}
                  style={cardAnimation}
                  className='bg-white p-4 rounded-lg shadow hover:shadow-lg transition transform hover:scale-105'
                >
                  <img
                    src={rec.books.thumbnail || '/placeholder.jpg'}
                    alt={rec.books.title}
                    className='w-full h-40 object-cover rounded-lg'
                  />
                  <h3 className='text-lg font-semibold mt-4'>
                    {rec.books.title}
                  </h3>
                  <p className='text-slate-600'>
                    {rec.books.authors.join(', ')}
                  </p>
                  <p className='text-slate-500 text-sm mt-2 italic'>
                    {rec.reason}
                  </p>
                </animated.div>
              ))}
            </div>
          )}
        </animated.section>
      </div>
    </div>
  );
}

export default UserDashboardPage;
