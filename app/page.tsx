import { prisma } from "@/lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany();

  return (
    <>
      <h1>Working on DB connection</h1>
      <span>Users: {users.length}</span>
    </>
  );
}
