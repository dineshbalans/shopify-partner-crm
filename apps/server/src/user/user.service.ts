import { Injectable, HttpException, HttpStatus, ConsoleLogger } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { DateHelper } from '@org/utils';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import prisma from '../shared/utils/prisma';
const client = new OAuth2Client(
  "639566010681-lt4gkh6lf2v6s6nap66vfvjpueqaqgkm.apps.googleusercontent.com",
 "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"
);

@Injectable()
export class UserService {
  
  async create(data:  Omit<any, "error" | "error_description" | "error_uri">) {
    try {
      const user = await client.verifyIdToken({
        idToken: data.credential,
        audience: data.clientId,
      });
      const payload = user.getPayload();
      const upsertedUser = await prisma.user.upsert({
        where: {
          email: payload.email,
        },
        update: {
          name: payload.name,
          avatarUrl: payload.picture,
          updatedAt: DateHelper.getCurrentUnixTime(),
          deletedAt: 0,
        },
        create: {
          name: payload.name,
          email: payload.email,
          avatarUrl: payload.picture,
          authenticationMethod: 'GOOGLE',
          createdAt: DateHelper.getCurrentUnixTime(),
          deletedAt: 0,
        },
      });
      return {
        status: true,
        message: 'User created successfully.',
        data: upsertedUser,
      };
    } catch (error) {
      throw new HttpException(
        'Invalid data for user. Please check the provided data.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async delete(id: string) {
    try {
      return {
        status: true,
        message: 'User deleted successfully.',
      };
    } catch (error) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }
  }

  async update(id: string, userDto: CreateUserDto) {
    try {
      const user = {
        status: true,
        message: 'User name updated successfully.',
        data: { id: '1', name: 'Jane Doe' },
      };
      return user;
    } catch (error) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }
  }

  async findOne(id: string) {
    try {
      const user = {
        status: true,
        message: 'User retrieved successfully.',
        data: { id: '1', name: 'John Doe' },
      };
      return user;
    } catch (error) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }
  }
}
