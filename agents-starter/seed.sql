-- Seed data for Resume Builder (Local Development)
-- Run with: npx wrangler d1 execute DB --local --file=./seed.sql

-- Clear existing data (for clean testing)
DELETE FROM generated_resumes;
DELETE FROM resume_items;
DELETE FROM users;

-- Create demo user
INSERT INTO users (id, email, name, created_at, updated_at) VALUES 
(1, 'demo@example.com', 'Demo User', '2024-01-01 10:00:00', '2024-01-01 10:00:00');

-- Sample Experience Items
INSERT INTO resume_items (
  user_id, type, title, description, organization, start_date, end_date, 
  location, is_current, tools, project_type, github_link, award, resume_item_name,
  created_at, updated_at
) VALUES 

-- Work Experience
(1, 'experience', 'Senior Software Engineer', 
 'Led development of microservices architecture serving 1M+ users. Designed and implemented RESTful APIs, mentored junior developers, and improved system performance by 40%. Technologies: React, Node.js, PostgreSQL, AWS.',
 'Tech Innovators Inc.', '2022-03', NULL, 'San Francisco, CA', true, 
 NULL, NULL, NULL, NULL, NULL,
 '2024-01-15 09:00:00', '2024-01-15 09:00:00'),

(1, 'experience', 'Software Engineer', 
 'Developed full-stack web applications using modern JavaScript frameworks. Collaborated with product managers and designers to deliver user-focused features. Implemented automated testing suites and CI/CD pipelines.',
 'StartupXYZ', '2020-06', '2022-02', 'Remote', false,
 NULL, NULL, NULL, NULL, NULL,
 '2024-01-15 09:05:00', '2024-01-15 09:05:00'),

(1, 'experience', 'Frontend Developer Intern', 
 'Built responsive web interfaces using React and TypeScript. Participated in code reviews and agile development processes. Created reusable component library that reduced development time by 25%.',
 'Digital Solutions LLC', '2019-06', '2019-08', 'Boston, MA', false,
 NULL, NULL, NULL, NULL, NULL,
 '2024-01-15 09:10:00', '2024-01-15 09:10:00'),

-- Projects
(1, 'project', 'AI-Powered Resume Builder', 
 'Full-stack web application that uses AI to help users create professional resumes. Features include real-time editing, PDF generation, and ATS optimization. Built with React, Node.js, and Cloudflare Workers.',
 NULL, '2024-01', '2024-09', NULL, false,
 'React, TypeScript, Node.js, Cloudflare Workers, D1, Workers AI', 'personal', 'https://github.com/user/resume-builder', NULL, NULL,
 '2024-01-15 09:15:00', '2024-01-15 09:15:00'),

(1, 'project', 'E-Commerce Platform', 
 'Built a complete e-commerce solution with payment processing, inventory management, and admin dashboard. Implemented secure authentication, shopping cart functionality, and order tracking.',
 NULL, '2023-06', '2023-12', NULL, false,
 'Next.js, Prisma, PostgreSQL, Stripe, Tailwind CSS', 'personal', 'https://github.com/user/ecommerce-platform', NULL, NULL,
 '2024-01-15 09:20:00', '2024-01-15 09:20:00'),

(1, 'project', 'Social Media Analytics Dashboard', 
 'Team project for university course. Created analytics dashboard for social media metrics with real-time data visualization. Implemented data pipeline processing 100k+ posts daily.',
 NULL, '2019-09', '2019-12', NULL, false,
 'Python, Django, PostgreSQL, Chart.js, Redis', 'school', 'https://github.com/team/social-analytics', NULL, NULL,
 '2024-01-15 09:25:00', '2024-01-15 09:25:00'),

-- Competitions
(1, 'competition', 'Best Innovation Award', 
 'Led team of 4 developers to create AI-powered study assistant. Solution helped students improve retention by 35% through personalized learning paths and spaced repetition algorithms.',
 'University Tech Competition', NULL, NULL, NULL, false,
 NULL, NULL, NULL, 'First Place - Best Innovation Award', 'AI Study Assistant',
 '2024-01-15 09:30:00', '2024-01-15 09:30:00'),

(1, 'competition', 'Finalist', 
 'Developed blockchain-based voting system ensuring transparency and security. Implemented smart contracts and created intuitive user interface for seamless voting experience.',
 'National Hackathon 2023', NULL, NULL, NULL, false,
 NULL, NULL, NULL, 'Top 10 Finalist', 'SecureVote Platform',
 '2024-01-15 09:35:00', '2024-01-15 09:35:00'),

-- Skills
(1, 'skill', 'JavaScript & TypeScript', 
 'Expert proficiency in modern JavaScript (ES6+) and TypeScript. Experience with React, Vue.js, Node.js, and Express. Built 15+ production applications using these technologies.',
 NULL, NULL, NULL, NULL, false,
 NULL, NULL, NULL, NULL, NULL,
 '2024-01-15 09:40:00', '2024-01-15 09:40:00'),

(1, 'skill', 'Cloud Architecture', 
 'Proficient in AWS services (EC2, S3, Lambda, RDS) and Cloudflare platform. Designed scalable architectures handling millions of requests. Experience with Infrastructure as Code using Terraform.',
 NULL, NULL, NULL, NULL, false,
 NULL, NULL, NULL, NULL, NULL,
 '2024-01-15 09:45:00', '2024-01-15 09:45:00'),

(1, 'skill', 'Database Management', 
 'Strong experience with SQL and NoSQL databases including PostgreSQL, MySQL, MongoDB, and Redis. Optimized queries improving performance by 60%. Database schema design and migration expertise.',
 NULL, NULL, NULL, NULL, false,
 NULL, NULL, NULL, NULL, NULL,
 '2024-01-15 09:50:00', '2024-01-15 09:50:00'),

-- Extracurricular Activities
(1, 'extracurricular', 'Computer Science Club President', 
 'Led 50+ member organization focused on promoting coding skills and technology awareness. Organized weekly workshops, coding competitions, and industry speaker events. Increased membership by 40% during tenure.',
 'University Computer Science Club', '2018-09', '2020-05', 'University Campus', false,
 NULL, NULL, NULL, NULL, NULL,
 '2024-01-15 09:55:00', '2024-01-15 09:55:00'),

(1, 'extracurricular', 'Volunteer Coding Instructor', 
 'Teach basic programming concepts to underserved youth aged 12-18. Developed curriculum covering HTML, CSS, JavaScript, and Python. Mentored 30+ students with 90% course completion rate.',
 'Code for Community', '2021-01', NULL, 'Community Center', true,
 NULL, NULL, NULL, NULL, NULL,
 '2024-01-15 10:00:00', '2024-01-15 10:00:00'),

(1, 'extracurricular', 'Open Source Contributor', 
 'Active contributor to popular open source projects including React documentation and various NPM packages. Contributed 50+ pull requests improving accessibility and performance.',
 'Various Open Source Projects', '2020-01', NULL, 'Remote', true,
 NULL, NULL, NULL, NULL, NULL,
 '2024-01-15 10:05:00', '2024-01-15 10:05:00');

-- Sample Generated Resume
INSERT INTO generated_resumes (
  user_id, title, job_posting, job_company, job_title, 
  template_name, selected_items, latex_content, pdf_url, status,
  created_at, updated_at
) VALUES 
(1, 'Software Engineer Resume - Tech Innovators', 
 'We are looking for a passionate Software Engineer to join our growing team...', 
 'Tech Innovators Inc.', 'Senior Software Engineer',
 'professional', '[1,2,5,6,9,10]', NULL, NULL, 'draft',
 '2024-01-15 11:00:00', '2024-01-15 11:00:00');