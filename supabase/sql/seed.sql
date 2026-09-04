-- Seed for all SQL examples - run once in Supabase SQL Editor
-- Also used by reset.sql

drop table if exists employees cascade;
drop table if exists orders cascade;
drop table if exists users cascade;

create table users (
  id int primary key,
  name text not null,
  country text not null,
  bio text
);

create table orders (
  id int primary key,
  user_id int not null references users(id),
  amount numeric not null,
  status text not null check (status in ('paid','pending','cancelled')),
  created_at timestamp default now()
);

create table employees (
  id int primary key,
  name text not null,
  role text not null,
  manager_id int references employees(id)
);

insert into users (id, name, country, bio) values
  (1,'Alice','USA','Senior engineer with 10 years experience'),
  (2,'Bob','USA','Product manager focused on growth'),
  (3,'Sai','India','Full stack developer and open source contributor');

insert into orders (id, user_id, amount, status) values
  (1,1,100,'paid'),
  (2,1,50,'paid'),
  (3,1,20,'pending'),
  (4,2,200,'paid'),
  (5,2,30,'cancelled'),
  (6,3,300,'paid'),
  (7,3,10,'paid');

insert into employees (id, name, role, manager_id) values
  (1,'Diana','CEO',NULL),
  (2,'Eve','VP Engineering',1),
  (3,'Frank','Eng Manager',2),
  (4,'Grace','Senior Dev',3),
  (5,'Heidi','Junior Dev',3),
  (6,'Ivan','DevOps',2);

-- Verify: 3 users, 7 orders, 6 employees
-- select * from users; select * from orders; select * from employees;
