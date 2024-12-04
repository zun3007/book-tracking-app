import { useEffect, useState } from 'react';
import type { ReactQuillProps } from 'react-quill';

type QuillModule = (typeof import('react-quill'))['default'];

export default function Editor(props: ReactQuillProps) {
  const [mounted, setMounted] = useState(false);
  const [QuillComponent, setQuillComponent] = useState<QuillModule | null>(
    null
  );

  useEffect(() => {
    setMounted(true);
    const loadQuill = async () => {
      try {
        const quillModule = await import('react-quill');
        setQuillComponent(() => quillModule.default);
      } catch (error) {
        console.error('Error loading Quill:', error);
      }
    };

    loadQuill();
  }, []);

  if (!mounted || !QuillComponent) {
    return <div className='h-64 bg-gray-100 rounded-lg animate-pulse' />;
  }

  return <QuillComponent {...props} />;
}
