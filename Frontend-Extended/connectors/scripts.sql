-- don't forget to create scheme "backendTutorial"

-- drop table if exists "backendTutorial"."User";
-- drop table if exists "backendTutorial"."Session";
-- drop table if exists "backendTutorial"."Employee";

create table if not exists "backendTutorial"."User"
(
    "id" serial primary key,
    "name" text not null,
    "email" text not null,
    "password" text not null,
    "role" text not null default 'customer'
);

create table if not exists "backendTutorial"."Session"
(
    "id" serial primary key,
    "userId" integer not null,
    "token" text not null,
    "expiresAt" timestamp not null
);


create table if not exists "backendTutorial"."Employee"(

id serial primary key, 
firstName text not null,
middleName text not null,
lastName text not null,
country text not null,
salary integer not null,
birthDate date not null 
);



