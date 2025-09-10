/*
  # Add Sample Data for Demo

  1. Sample Boards
    - "Project Alpha" - A software development project
    - "Marketing Campaign" - A marketing project
    - "Launch Prep" - Product launch preparation

  2. Sample Lists
    - Each board will have typical project management lists
    - To Do, In Progress, Review, Done

  3. Sample Cards
    - Various tasks with different priorities and due dates
    - Some with labels and descriptions

  This migration creates realistic demo data for users to explore the application.
*/

-- Insert sample boards for demo user (will be created when user signs up)
-- Note: This will be populated when a demo user signs up via the application

-- Function to create demo data for a new user
CREATE OR REPLACE FUNCTION create_demo_data_for_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  board_1_id uuid;
  board_2_id uuid;
  board_3_id uuid;
  
  list_1_1_id uuid;
  list_1_2_id uuid;
  list_1_3_id uuid;
  list_1_4_id uuid;
  
  list_2_1_id uuid;
  list_2_2_id uuid;
  list_2_3_id uuid;
  
  list_3_1_id uuid;
  list_3_2_id uuid;
  list_3_3_id uuid;
BEGIN
  -- Create sample boards
  INSERT INTO boards (id, title, description, owner_id) VALUES
    (gen_random_uuid(), 'Project Alpha', 'Main software development project with key features and milestones', user_id),
    (gen_random_uuid(), 'Marketing Campaign', 'Q1 marketing campaign planning and execution', user_id),
    (gen_random_uuid(), 'Launch Prep', 'Product launch preparation and coordination', user_id)
  RETURNING id INTO board_1_id;
  
  -- Get the created board IDs
  SELECT id INTO board_1_id FROM boards WHERE title = 'Project Alpha' AND owner_id = user_id;
  SELECT id INTO board_2_id FROM boards WHERE title = 'Marketing Campaign' AND owner_id = user_id;
  SELECT id INTO board_3_id FROM boards WHERE title = 'Launch Prep' AND owner_id = user_id;
  
  -- Create lists for Project Alpha
  INSERT INTO lists (id, title, board_id, position) VALUES
    (gen_random_uuid(), 'Backlog', board_1_id, 0),
    (gen_random_uuid(), 'In Progress', board_1_id, 1),
    (gen_random_uuid(), 'Review', board_1_id, 2),
    (gen_random_uuid(), 'Done', board_1_id, 3)
  RETURNING id INTO list_1_1_id;
  
  -- Get list IDs for Project Alpha
  SELECT id INTO list_1_1_id FROM lists WHERE title = 'Backlog' AND board_id = board_1_id;
  SELECT id INTO list_1_2_id FROM lists WHERE title = 'In Progress' AND board_id = board_1_id;
  SELECT id INTO list_1_3_id FROM lists WHERE title = 'Review' AND board_id = board_1_id;
  SELECT id INTO list_1_4_id FROM lists WHERE title = 'Done' AND board_id = board_1_id;
  
  -- Create lists for Marketing Campaign
  INSERT INTO lists (id, title, board_id, position) VALUES
    (gen_random_uuid(), 'Ideas', board_2_id, 0),
    (gen_random_uuid(), 'In Progress', board_2_id, 1),
    (gen_random_uuid(), 'Completed', board_2_id, 2);
    
  -- Get list IDs for Marketing Campaign
  SELECT id INTO list_2_1_id FROM lists WHERE title = 'Ideas' AND board_id = board_2_id;
  SELECT id INTO list_2_2_id FROM lists WHERE title = 'In Progress' AND board_id = board_2_id;
  SELECT id INTO list_2_3_id FROM lists WHERE title = 'Completed' AND board_id = board_2_id;
  
  -- Create lists for Launch Prep
  INSERT INTO lists (id, title, board_id, position) VALUES
    (gen_random_uuid(), 'Planning', board_3_id, 0),
    (gen_random_uuid(), 'Executing', board_3_id, 1),
    (gen_random_uuid(), 'Complete', board_3_id, 2);
    
  -- Get list IDs for Launch Prep
  SELECT id INTO list_3_1_id FROM lists WHERE title = 'Planning' AND board_id = board_3_id;
  SELECT id INTO list_3_2_id FROM lists WHERE title = 'Executing' AND board_id = board_3_id;
  SELECT id INTO list_3_3_id FROM lists WHERE title = 'Complete' AND board_id = board_3_id;
  
  -- Create sample cards for Project Alpha
  INSERT INTO cards (title, description, list_id, position, due_date, labels) VALUES
    ('User Authentication System', 'Implement JWT-based authentication with login, register, and logout functionality', list_1_1_id, 0, now() + interval '7 days', ARRAY['backend', 'high-priority']),
    ('Dashboard UI Design', 'Create modern dashboard interface with responsive design', list_1_1_id, 1, now() + interval '5 days', ARRAY['frontend', 'design']),
    ('Database Schema Design', 'Design and implement PostgreSQL schema for all entities', list_1_2_id, 0, now() + interval '3 days', ARRAY['backend', 'database']),
    ('API Development', 'Build RESTful API endpoints for CRUD operations', list_1_2_id, 1, now() + interval '10 days', ARRAY['backend', 'api']),
    ('Drag & Drop Implementation', 'Implement drag and drop functionality for cards and lists', list_1_3_id, 0, null, ARRAY['frontend', 'feature']),
    ('User Testing', 'Conduct user testing sessions and gather feedback', list_1_4_id, 0, now() - interval '2 days', ARRAY['testing', 'ux']),
    ('Setup CI/CD Pipeline', 'Configure automated testing and deployment pipeline', list_1_4_id, 1, now() - interval '5 days', ARRAY['devops', 'completed']);
    
  -- Create sample cards for Marketing Campaign
  INSERT INTO cards (title, description, list_id, position, due_date, labels) VALUES
    ('Social Media Strategy', 'Develop comprehensive social media marketing strategy', list_2_1_id, 0, now() + interval '14 days', ARRAY['social-media', 'strategy']),
    ('Content Calendar', 'Create content calendar for Q1 marketing activities', list_2_1_id, 1, now() + interval '7 days', ARRAY['content', 'planning']),
    ('Email Campaign Design', 'Design and develop email marketing templates', list_2_2_id, 0, now() + interval '5 days', ARRAY['email', 'design']),
    ('Influencer Outreach', 'Identify and reach out to potential influencer partners', list_2_2_id, 1, now() + interval '10 days', ARRAY['partnerships', 'outreach']),
    ('Brand Guidelines', 'Finalize brand guidelines and style guide', list_2_3_id, 0, now() - interval '3 days', ARRAY['branding', 'completed']);
    
  -- Create sample cards for Launch Prep
  INSERT INTO cards (title, description, list_id, position, due_date, labels) VALUES
    ('Launch Timeline', 'Create detailed timeline for product launch activities', list_3_1_id, 0, now() + interval '3 days', ARRAY['planning', 'timeline']),
    ('Press Release', 'Write and distribute press release for product launch', list_3_1_id, 1, now() + interval '14 days', ARRAY['pr', 'content']),
    ('Beta Testing Program', 'Set up and manage beta testing program', list_3_2_id, 0, now() + interval '7 days', ARRAY['testing', 'feedback']),
    ('Launch Event Planning', 'Organize virtual launch event and webinar', list_3_2_id, 1, now() + interval '21 days', ARRAY['event', 'marketing']),
    ('Documentation Review', 'Final review of all user documentation', list_3_3_id, 0, now() - interval '1 day', ARRAY['docs', 'completed']);
END;
$$;