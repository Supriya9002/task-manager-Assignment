/*
  # Initial Schema Setup for Task Management App

  1. New Tables
    - `boards`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, optional)
      - `owner_id` (uuid, references auth.users)
      - `background_color` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `lists` 
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `board_id` (uuid, references boards)
      - `position` (integer, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `cards`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, optional)
      - `list_id` (uuid, references lists)
      - `position` (integer, not null)
      - `due_date` (timestamptz, optional)
      - `labels` (text array)
      - `assigned_user_id` (uuid, optional, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `board_members`
      - `id` (uuid, primary key)
      - `board_id` (uuid, references boards)
      - `user_id` (uuid, references auth.users)
      - `role` (text, not null, check constraint for admin/editor/viewer)
      - `created_at` (timestamptz)

    - `comments`
      - `id` (uuid, primary key)
      - `card_id` (uuid, references cards)
      - `user_id` (uuid, references auth.users)
      - `content` (text, not null)
      - `created_at` (timestamptz)

    - `activities`
      - `id` (uuid, primary key)
      - `board_id` (uuid, references boards)
      - `user_id` (uuid, references auth.users)
      - `action` (text, not null)
      - `entity_type` (text, not null)
      - `entity_id` (uuid, not null)
      - `details` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Board members can access board-related data based on their role
    - Activity logs are readable by board members

  3. Indexes
    - Add indexes for frequently queried columns
    - Optimize for board listing, card filtering, and search operations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  background_color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lists table
CREATE TABLE IF NOT EXISTS lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  due_date timestamptz,
  labels text[] DEFAULT ARRAY[]::text[],
  assigned_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create board_members table
CREATE TABLE IF NOT EXISTS board_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(board_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('board', 'list', 'card')),
  entity_id uuid NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for boards
CREATE POLICY "Users can read their own boards"
  ON boards FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own boards"
  ON boards FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own boards"
  ON boards FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own boards"
  ON boards FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create policies for lists
CREATE POLICY "Users can read lists from their boards"
  ON lists FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND boards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert lists to their boards"
  ON lists FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_id 
      AND boards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update lists in their boards"
  ON lists FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND boards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete lists from their boards"
  ON lists FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND boards.owner_id = auth.uid()
    )
  );

-- Create policies for cards
CREATE POLICY "Users can read cards from their boards"
  ON cards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists 
      INNER JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id 
      AND boards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cards to their boards"
  ON cards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists 
      INNER JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = list_id 
      AND boards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards in their boards"
  ON cards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists 
      INNER JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id 
      AND boards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards from their boards"
  ON cards FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists 
      INNER JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id 
      AND boards.owner_id = auth.uid()
    )
  );

-- Create policies for board_members
CREATE POLICY "Board owners can manage members"
  ON board_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their own memberships"
  ON board_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for comments
CREATE POLICY "Users can read comments from their boards"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cards 
      INNER JOIN lists ON lists.id = cards.list_id
      INNER JOIN boards ON boards.id = lists.board_id
      WHERE cards.id = comments.card_id 
      AND boards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert comments to their boards"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM cards 
      INNER JOIN lists ON lists.id = cards.list_id
      INNER JOIN boards ON boards.id = lists.board_id
      WHERE cards.id = card_id 
      AND boards.owner_id = auth.uid()
    )
  );

-- Create policies for activities
CREATE POLICY "Users can read activities from their boards"
  ON activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = activities.board_id 
      AND boards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert activities to their boards"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_id 
      AND boards.owner_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_boards_owner_id ON boards(owner_id);
CREATE INDEX IF NOT EXISTS idx_lists_board_id ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_lists_position ON lists(position);
CREATE INDEX IF NOT EXISTS idx_cards_list_id ON cards(list_id);
CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(position);
CREATE INDEX IF NOT EXISTS idx_cards_due_date ON cards(due_date);
CREATE INDEX IF NOT EXISTS idx_board_members_board_id ON board_members(board_id);
CREATE INDEX IF NOT EXISTS idx_board_members_user_id ON board_members(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_card_id ON comments(card_id);
CREATE INDEX IF NOT EXISTS idx_activities_board_id ON activities(board_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();