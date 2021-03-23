import { Migration } from '@mikro-orm/migrations';

export class Migration20210321185133 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("uuid" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" text not null, "password" text not null);');
    this.addSql('alter table "user" add constraint "user_pkey" primary key ("uuid");');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
  }

}
