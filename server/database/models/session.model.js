import { DataTypes } from "sequelize";
import { sequelize } from "../../config/Database.js";

const Session = sequelize.define(
	"Session",
	{
		session_name: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		session_number: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		session_webhook: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		status: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{ tableName: "sessions", timestamps: true }
);

export default Session;
