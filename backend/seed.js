// backend/seed.js
// Run ONCE to create pre-configured employee accounts:
//   node seed.js
//
// Employees cannot self-register. This script is the ONLY way to create them.
// In production this would be run by a system administrator on first deployment.

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const EMPLOYEES = [
    { fullName: 'James Okafor',   username: 'emp.james',  employeeId: 'EMP001', password: 'Employee@1234' },
    { fullName: 'Sarah Mitchell', username: 'emp.sarah',  employeeId: 'EMP002', password: 'Employee@5678' },
    { fullName: 'David Nkosi',    username: 'emp.david',  employeeId: 'EMP003', password: 'Employee@9012' },
];

const employeeSchema = new mongoose.Schema({
    fullName:   { type: String, required: true },
    username:   { type: String, required: true, unique: true },
    employeeId: { type: String, required: true, unique: true },
    password:   { type: String, required: true },
    role:       { type: String, default: 'employee' },
    createdAt:  { type: Date,   default: Date.now }
});

const Employee = mongoose.model('Employee', employeeSchema);

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');

        for (const emp of EMPLOYEES) {
            const exists = await Employee.findOne({ username: emp.username });
            if (exists) {
                console.log(`⏭  ${emp.username} already exists — skipping`);
                continue;
            }

            const salt     = await bcrypt.genSalt(12);
            const hashed   = await bcrypt.hash(emp.password, salt);

            await new Employee({
                fullName:   emp.fullName,
                username:   emp.username,
                employeeId: emp.employeeId,
                password:   hashed
            }).save();

            console.log(`✅ Created employee: ${emp.username} (${emp.employeeId})`);
        }

        console.log('\n🔐 Pre-configured employee credentials:');
        EMPLOYEES.forEach((e) =>
            console.log(`   ${e.username} / ${e.password}`)
        );
        console.log('\n⚠️  Share these credentials securely — never commit plain passwords.\n');

    } catch (err) {
        console.error('❌ Seed error:', err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seed();