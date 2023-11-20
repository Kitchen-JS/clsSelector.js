/**
* Do Not Edit
* Data Structure Library Last Updated: 4/5/2023 4:13:04 PM
* This file was generated programmatically using DataModelGen via the Entity Model & Rule Sets
* Do Not Edit
*/
class clsNoteComments extends clsBaseData
{
	constructor(options)
	{
		super(options);

		this.Active = true;
		this.Comment = null;
		this.CreatedBy = null;
		this.LastUpdatedBy = null;
		this.NoteCommentID = null;
		this.RecordCreatedDateTime = null;
		this.RecordLastUpdateDateTime = null;

		this._dataTypes = {"Active":"bit","Comment":"varchar(MAX)","CreatedBy":"int","LastUpdatedBy":"int","NoteCommentID":"int","RecordCreatedDateTime":"datetime","RecordLastUpdateDateTime":"datetime"};

		this._primaryKey = 'NoteCommentID';
	}
}
class clsNotes extends clsBaseData
{
	constructor(options)
	{
		super(options);

		this.Active = true;
		this.CreatedBy = null;
		this.JsonData = null;
		this.LastUpdatedBy = null;
		this.Note = null;
		this.NoteID = null;
		this.NoteType = null;
		this.PublicFlag = null;
		this.RecordCreatedDateTime = null;
		this.RecordLastUpdateDateTime = null;
		this.Title = null;

		this._dataTypes = {"Active":"bit","CreatedBy":"int","JsonData":"varchar(MAX)","LastUpdatedBy":"int","Note":"varchar(MAX)","NoteID":"int","NoteType":"varchar(100)","PublicFlag":"bit","RecordCreatedDateTime":"datetime","RecordLastUpdateDateTime":"datetime","Title":"varchar(300)"};

		this._primaryKey = 'NoteID';
	}
}
class clsNoteTypes extends clsBaseData
{
	constructor(options)
	{
		super(options);

		this.Active = true;
		this.CreatedBy = null;
		this.Description = null;
		this.LastUpdatedBy = null;
		this.Name = null;
		this.NoteTypeID = null;
		this.RecordCreatedDateTime = null;
		this.RecordLastUpdateDateTime = null;

		this._dataTypes = {"Active":"bit","CreatedBy":"int","Description":"varchar(MAX)","LastUpdatedBy":"int","Name":"varchar(150)","NoteTypeID":"int","RecordCreatedDateTime":"datetime","RecordLastUpdateDateTime":"datetime"};

		this._primaryKey = 'NoteTypeID';
	}
}
class clsSearchStopWords extends clsBaseData
{
	constructor(options)
	{
		super(options);

		this.Active = true;
		this.CreatedBy = null;
		this.LastUpdatedBy = null;
		this.RecordCreatedDateTime = null;
		this.RecordLastUpdateDateTime = null;
		this.SearchStopWordID = null;
		this.word = null;

		this._dataTypes = {"Active":"bit","CreatedBy":"int","LastUpdatedBy":"int","RecordCreatedDateTime":"datetime","RecordLastUpdateDateTime":"datetime","SearchStopWordID":"int","word":"varchar(800)"};

		this._primaryKey = 'SearchStopWordID';
	}
}
class clsUsers extends clsBaseData
{
	constructor(options)
	{
		super(options);

		this.Active = true;
		this.CreatedBy = null;
		this.Email = null;
		this.FName = null;
		this.LastUpdatedBy = null;
		this.LName = null;
		this.Phone = null;
		this.RecordCreatedDateTime = null;
		this.RecordLastUpdateDateTime = null;
		this.UserID = null;

		this._dataTypes = {"Active":"bit","CreatedBy":"int","Email":"varchar(500)","FName":"varchar(150)","LastUpdatedBy":"int","LName":"varchar(150)","Phone":"varchar(50)","RecordCreatedDateTime":"datetime","RecordLastUpdateDateTime":"datetime","UserID":"int"};

		this._primaryKey = 'UserID';
	}
}
/**
* Do Not Edit
* Data Structure Library Last Updated: 4/5/2023 4:13:04 PM
* This file was generated programmatically using DataModelGen via the Entity Model & Rule Sets
* Do Not Edit
*/
