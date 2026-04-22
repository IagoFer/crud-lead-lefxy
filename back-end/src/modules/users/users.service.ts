import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const adminEmail = 'admin@lefxy.com';
    const existing = await this.userModel.findOne({ email: adminEmail });

    if (!existing) {
      this.logger.log('Seeding default admin user...');
      const passwordHash = await bcrypt.hash('admin123', 10);
      await this.userModel.create({
        email: adminEmail,
        passwordHash,
        name: 'Admin LEFXY',
        role: 'admin',
      });
      this.logger.log('Admin user created: admin@lefxy.com / admin123');
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }
}
