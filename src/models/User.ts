const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } = require("typeorm");

@Entity("users")
class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string; // Adiciona '!' para dizer que será atribuído

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  role!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}

module.exports = User;
