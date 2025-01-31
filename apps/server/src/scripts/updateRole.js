"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("@phyt/database");
function updateUserToRunner(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, database_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var updatedUser, existingRunner, newRunner;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx
                                            .update(database_1.users)
                                            .set({ role: 'runner' })
                                            .where((0, database_1.eq)(database_1.users.id, userId))
                                            .returning()];
                                    case 1:
                                        updatedUser = (_a.sent())[0];
                                        if (!updatedUser) {
                                            throw new Error("No user found with ID ".concat(userId));
                                        }
                                        return [4 /*yield*/, tx
                                                .select()
                                                .from(database_1.runners)
                                                .where((0, database_1.eq)(database_1.runners.user_id, userId))
                                                .limit(1)];
                                    case 2:
                                        existingRunner = _a.sent();
                                        if (!(existingRunner.length === 0)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, tx
                                                .insert(database_1.runners)
                                                .values({
                                                user_id: userId,
                                                average_pace: null,
                                                total_distance_m: 0,
                                                total_runs: 0,
                                                best_mile_time: null
                                            })
                                                .returning()];
                                    case 3:
                                        newRunner = (_a.sent())[0];
                                        console.log("Created new runner entry with ID ".concat(newRunner.id));
                                        _a.label = 4;
                                    case 4:
                                        console.log("Successfully updated user ".concat(updatedUser.username, " (ID: ").concat(updatedUser.id, ") to runner role"));
                                        return [2 /*return*/, updatedUser];
                                }
                            });
                        }); })];
                case 1: 
                // Start a transaction since we're modifying multiple tables
                return [2 /*return*/, _a.sent()];
                case 2:
                    error_1 = _a.sent();
                    console.error("Failed to update user ".concat(userId, " to runner:"), error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Script to run
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var userId, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (process.argv.length < 3) {
                        console.error('Please provide a user ID');
                        process.exit(1);
                    }
                    userId = parseInt(process.argv[2]);
                    if (isNaN(userId)) {
                        console.error('Please provide a valid numeric user ID');
                        process.exit(1);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, updateUserToRunner(userId)];
                case 2:
                    _a.sent();
                    console.log('Update completed successfully');
                    process.exit(0);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Script failed:', error_2);
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
main();
