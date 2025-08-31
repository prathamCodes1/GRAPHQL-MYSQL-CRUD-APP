import { gql } from "apollo-server-express";
import dotenv from 'dotenv';
import { db } from '../database/connection.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config('.env');

export const typeDefs = gql`
type Query{
    getUserById(id: ID!): User
    getUserOrders(id: ID!): Orders
}
type Mutation {
    addEmployee(input: AddEmployeeInput): User
    addResident(input: AddResidentInput): User
}

type Orders {
    id: ID!
    price: String
}

interface User {
    id: ID
    name: String
    type: UserTypeEnum
}

interface UserInput {
    name: String!
    type: UserTypeEnum!
}

enum UserTypeEnum {
    EMPLOYEE
    RESIDENT
}

type Employee implements User {
    id: ID
    name: String
    type: UserTypeEnum
    departmentName: String
}
type Resident implements User{
    id: ID
    name: String
    type: UserTypeEnum
    apartmentName: String
}
input AddEmployeeInput {
    name: String!
    type: UserTypeEnum!
    departmentName: String!
}
input AddResidentInput {
    name: String!
    type: UserTypeEnum!
    apartmentName: String!
}
`


export const resolvers = {
    Query: {
        getUserById: async (obj, args, context, info) => {
            const query = await fs.readFile(path.join(__dirname, '../database/queries/getUserById.txt'), 'utf8');
            const [result] = await db.execute(query, [args.id]);
            return {
                id: result[0]?.id,
                name: result[0]?.name,
                type: result[0]?.type,
                apartmentName: result[0]?.apartmentName
            }
        },
        getUserOrders: async (obj, args, info, context) => {
            return {
                id: 1,
                price: 200
            }
        }
    },
    Mutation: {
        addResident: async (obj, args, context, info) => {
            const { name, apartmentName } = args.input;
            const query = await fs.readFile(path.join(__dirname, '../database/queries/addResident.txt'), 'utf8');
            const [result] = await db.execute(query, [name, 'RESIDENT', apartmentName]);
            console.log('My result', result, query);
            return {
                id: result.insertId,
                name: name,
                type: 'RESIDENT',
                apartmentName: apartmentName
            }
        },
        addEmployee: (obj, args, context, info) => {
            return {
                id: id,
                name: 'Shubhankar',
                type: 'EMPLOYEE',
                departmentName: 'Engineering'
            }
        }
    },
    User: {
        __resolveType(obj) {
            if (obj.type === 'RESIDENT') {
                return 'Resident';
            }

            if (obj.type === 'EMPLOYEE') {
                return 'Employee'
            }
        }
    },
}