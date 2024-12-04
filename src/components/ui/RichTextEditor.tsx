import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { supabase } from '../../config/supabaseClient';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Palette,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface Profile {
  id: string;
  email: string;
}

interface MentionList {
  items: Profile[];
  command: (item: { id: string; label: string }) => void;
}

class MentionListComponent {
  constructor(private props: MentionList) {
    this.selectItem = this.selectItem.bind(this);
  }

  selectItem(item: Profile) {
    this.props.command({ id: item.id, label: item.email });
  }

  onKeyDown({ event }: { event: KeyboardEvent }) {
    if (event.key === 'Enter' && this.props.items.length > 0) {
      this.selectItem(this.props.items[0]);
      return true;
    }
    return false;
  }

  updateProps(props: MentionList) {
    this.props = props;
  }

  destroy() {
    // Cleanup if needed
  }
}

const colors = [
  '#958DF1',
  '#F98181',
  '#FBBC88',
  '#FAF594',
  '#70CFF8',
  '#94FADB',
  '#B9F18D',
];

const MenuButton = ({
  onClick,
  isActive = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
      isActive
        ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/50'
        : 'text-gray-600 dark:text-gray-300'
    }`}
    title={title}
  >
    {children}
  </button>
);

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:underline cursor-pointer',
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: async ({ query }) => {
            const { data, error } = await supabase
              .from('profiles')
              .select('id, email')
              .ilike('email', `%${query}%`)
              .limit(5);

            if (error) {
              console.error('Error fetching mentions:', error);
              return [];
            }

            return data || [];
          },
          render: () => {
            let component: MentionListComponent;

            return {
              onStart: (props) => {
                component = new MentionListComponent(props);
              },
              onUpdate(props) {
                component.updateProps(props);
              },
              onKeyDown(props) {
                return component.onKeyDown(props);
              },
              onExit() {
                component.destroy();
              },
            };
          },
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = () => {
    const url = window.prompt('URL:');

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor
      ?.chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className='prose prose-sm max-w-none border rounded-lg overflow-hidden dark:prose-invert relative'>
      <div className='flex flex-wrap gap-1 border-b dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800'>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title='Bold'
        >
          <Bold size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title='Italic'
        >
          <Italic size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title='Strikethrough'
        >
          <Strikethrough size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title='Code'
        >
          <Code size={18} />
        </MenuButton>

        <div className='w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1' />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title='Bullet List'
        >
          <List size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title='Numbered List'
        >
          <ListOrdered size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title='Quote'
        >
          <Quote size={18} />
        </MenuButton>

        <MenuButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title='Add Link'
        >
          <LinkIcon size={18} />
        </MenuButton>

        <div className='w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1' />

        <div className='relative group'>
          <MenuButton onClick={() => {}} title='Text Color'>
            <Palette size={18} />
          </MenuButton>
          <div className='absolute top-full left-0 mt-1 hidden group-hover:flex bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 gap-1 z-10'>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => editor.chain().focus().setColor(color).run()}
                className='w-6 h-6 rounded-full'
                style={{ backgroundColor: color }}
                title={`Set text color to ${color}`}
              />
            ))}
          </div>
        </div>
      </div>

      <EditorContent
        editor={editor}
        className='min-h-[200px] p-4 focus:outline-none'
      />

      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className='bg-white dark:bg-gray-800 shadow-lg rounded-lg flex gap-1 p-2'
        >
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title='Bold'
          >
            <Bold size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title='Italic'
          >
            <Italic size={16} />
          </MenuButton>
          <MenuButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title='Add Link'
          >
            <LinkIcon size={16} />
          </MenuButton>
        </BubbleMenu>
      )}
    </div>
  );
}
