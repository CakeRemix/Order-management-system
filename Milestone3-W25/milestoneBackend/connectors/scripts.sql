-- ====================================
-- GIU Food Truck Management System
-- Database Schema Script
-- ====================================
-- Create new schema FoodTruck inside postgres database
-- Create these tables inside postgres using pgAdmin4
-- ====================================


-- Drop tables if they exist (in reverse order due to foreign key constraints)
drop table if exists "FoodTruck"."Sessions";
drop table if exists "FoodTruck"."Carts";
drop table if exists "FoodTruck"."OrderItems";
drop table if exists "FoodTruck"."Orders";
drop table if exists "FoodTruck"."MenuItems";
drop table if exists "FoodTruck"."Trucks";
drop table if exists "FoodTruck"."Users";

-- FoodTruck schema
create schema if not exists "FoodTruck";

-- Users Table
create table if not exists "FoodTruck"."Users"(
"userId" serial primary key,
"name" text not null,
"email" text not null unique,
"password" text not null,
"role" text default 'customer',
"birthDate" date default current_timestamp,
"createdAt" timestamp default current_timestamp
);


-- Trucks Table
create table if not exists "FoodTruck"."Trucks"(
"truckId" serial primary key,
"truckName" text not null unique,
"truckLogo" text,
"ownerId" integer not null,
"truckStatus" text default 'available',
"orderStatus" text default 'available',
"createdAt" timestamp default current_timestamp,
foreign key ("ownerId") references "FoodTruck"."Users"("userId") on delete cascade
);


-- MenuItems Table
create table if not exists "FoodTruck"."MenuItems"(
"itemId" serial primary key,
"truckId" integer not null,
"name" text not null,
"description" text,
"price" numeric(10,2) not null,
"category" text not null,
"status" text default 'available',
"createdAt" timestamp default current_timestamp,
foreign key ("truckId") references "FoodTruck"."Trucks"("truckId") on delete cascade
);


-- Orders Table
create table if not exists "FoodTruck"."Orders"(
"orderId" serial primary key,
"userId" integer not null,
"truckId" integer not null,
"orderStatus" text not null,
"totalPrice" numeric(10,2) not null,
"scheduledPickupTime" timestamp,
"estimatedEarliestPickup" timestamp,
"createdAt" timestamp default current_timestamp,
foreign key ("userId") references "FoodTruck"."Users"("userId") on delete cascade,
foreign key ("truckId") references "FoodTruck"."Trucks"("truckId") on delete cascade
);


-- OrderItems Table
create table if not exists "FoodTruck"."OrderItems"(
"orderItemId" serial primary key,
"orderId" integer not null,
"itemId" integer not null,
"quantity" integer not null,
"price" numeric(10,2) not null,
foreign key ("orderId") references "FoodTruck"."Orders"("orderId") on delete cascade,
foreign key ("itemId") references "FoodTruck"."MenuItems"("itemId") on delete cascade
);


-- Carts Table
create table if not exists "FoodTruck"."Carts"(
"cartId" serial primary key,
"userId" integer not null,
"itemId" integer not null,
"quantity" integer not null,
"price" numeric(10,2) not null,
foreign key ("userId") references "FoodTruck"."Users"("userId") on delete cascade,
foreign key ("itemId") references "FoodTruck"."MenuItems"("itemId") on delete cascade
);


-- Sessions Table
create table if not exists "FoodTruck"."Sessions"(
"id" serial primary key,
"userId" integer not null,
"token" text not null,
"expiresAt" timestamp default current_timestamp,
foreign key ("userId") references "FoodTruck"."Users"("userId") on delete cascade
);


