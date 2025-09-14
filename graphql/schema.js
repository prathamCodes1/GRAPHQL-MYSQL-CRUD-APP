import { gql } from "apollo-server-express";
import { db } from '../database/connection.js';
import { access, promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const typeDefs = gql`
type Query{
    getUserDetails(): User
    getUserOrders(id: ID!): Orders
    fetchAccountBalance(): Int
}
type Mutation {
    addEmployee(input: AddEmployeeInput): User
    addResident(input: AddResidentInput): User
    login(username: String, password: String): LoginResponse
    refreshToken(): LoginResponse
}

type LoginResponse {
    accessToken: String!
    refreshToken: String!
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
    username: String!
    password: String!
}
input AddResidentInput {
    name: String!
    type: UserTypeEnum!
    apartmentName: String!
    username: String!
    password: String!
}
`


export const resolvers = {
    Query: {
        getUserDetails: async (obj, args, context, info) => {
            const { id } = context;
            const query = await fs.readFile(path.join(__dirname, '../database/queries/getUserById.txt'), 'utf8');
            const [result] = await db.execute(query, [id]);
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
        },
    },
    Mutation: {
        addResident: async (obj, args, context, info) => {
            const { name, apartmentName, username, password } = args.input;
            const hashed = await bcrypt.hash(password, 10);
            const query = await fs.readFile(path.join(__dirname, '../database/queries/addResident.txt'), 'utf8');
            const [result] = await db.execute(query, [name, 'RESIDENT', apartmentName, username, hashed]);
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
        },
        login: async (obj, args, context, info) => {
            const { username, password } = args;
            const fetchUserByUsernameQuery = await fs.readFile(path.join(__dirname, '../database/queries/getUserByUsername.txt'), 'utf8');
            const [user] = await db.execute(fetchUserByUsernameQuery, [username]);

            if (!user?.id) {
                throw new Error('User not found!');
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                throw new Error('User not found!');
            }

            // generate accessToken and refresh token
            const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
            const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

            return {
                accessToken,
                refreshToken
            }
        },
        refreshToken: async (obj, args, context, info) => {
            const decoded = jwt.verify(context.refreshToken, process.JWT_SECRET_KEY);
            if (!decoded?.id) {
                throw new Error('Invalid Refresh Token');
            }

            // generate jwt token and send
            const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
            const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

            return {
                refreshToken,
                accessToken
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
        }
    }
}