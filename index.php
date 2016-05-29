<?php
session_start();

$indexUrl = str_replace('index.php', '', $_SERVER['PHP_SELF']);

if(isset($_GET['text'])) {
    $_SESSION['text'] = $_GET['text'];

    if(isset($_GET['actions'])) {
        $_SESSION['actions'] = $_GET['actions'];
    }
    header('Location: '.$indexUrl);
    exit;
} else if(isset($_GET['import'])) {
    $_SESSION['import'] = $_GET['import'];

    header('Location: '.$indexUrl);
    exit;
}
?>
<!DOCTYPE html>
<html lang="fr">

<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>MMM - Minecraft Message Maker</title>

    <link href="css/bootstrap.min.css" rel="stylesheet">

    <link href="css/sb-admin.css" rel="stylesheet">

    <link href="css/custom.css" rel="stylesheet">

    <link href="css/font-awesome.min.css" rel="stylesheet" type="text/css">

    <script src="js/jquery.js"></script>

    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>

<body>
    <script>
        <?php if(isset($_SESSION['actions'])): ?>
        var wactions = '<?= $_SESSION['actions'] ?>';
        <?php endif; ?>

        <?php if(isset($_SESSION['text'])): ?>
        var wtext = '<?= $_SESSION['text']?>';
        <?php endif; ?>

        <?php if(isset($_SESSION['import'])): ?>
        var wimport = '<?= $_SESSION['import']?>';
        <?php endif; ?>

        <?php session_destroy(); ?>
    </script>
	<div id="wrapper">
	    <!-- Navigation -->
        <nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="<?=$indexUrl?>">MMM - Minecraft Message Maker</a>
            </div>

            <!-- Sidebar Menu Items - These collapse to the responsive navigation menu on small screens -->
            <div class="collapse navbar-collapse navbar-ex1-collapse">
                <ul class="nav navbar-nav side-nav">
                    <li class="active">
                        <a href=""><i class="fa fa-home"></i> Home</a>
                    </li>
                    <li>
                        <a href=""><i class="fa fa-eraser"></i> Clear</a>
                    </li>
                    <li>
                        <a onclick="share();" class="cursor"><i class="fa fa-share"></i> Share <input class="hidden" id="shareinput" type="text" onclick="selectAll(this)" readonly></a>
                    </li>
                    <li>
                        <a href="#export" onclick="importStr();" class="cursor"><i class="fa fa-sign-in"></i> Import</a>
                    </li>
                    <li>
                        <a href="#export" onclick="exportStr();" class="cursor"><i class="fa fa-sign-out"></i> Export</a>
                    </li>
                </ul>
            </div>

            <!-- /.navbar-collapse -->
        </nav>

        <div id="page-wrapper">

            <div class="container-fluid">
            	<div class="row">
				    <div class="col-lg-12">
				        <h1 class="page-header">
				            MMM - Minecraft Message Maker
				        </h1>
				    </div>
				</div>

				<ol class="breadcrumb state">
		            <i class="fa fa-desktop"></i> Preview
		        </ol>

		        <div class="row">
			        <div class="col-lg-10 col-lg-offset-1">
			            <div id="preview"></div>
			        </div>
		        </div>

                <br>
                <div class="row">
                    <div class="col-lg-5 col-lg-offset-1">
                        Text: <span id="text"></span>
                    </div>
                    <div class="col-lg-5">
                        Style: <span id="style"></span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-lg-5 col-lg-offset-1">
                        ClickEvent: <button id='removeclickbutton' onclick='removeAction()' type="button" class="btn btn-xs btn-danger" disabled><i class="fa fa-trash-o"></i></button>
                        <ul>
                            <li>Action: <span id="click-action">None</span></li>
                            <li>Value: <span id="click-value">None</span></li>
                        </ul>
                    </div>
                    <div class="col-lg-5">
                        HoverEvent: <button id='removehoverbutton' onclick='removeAction(true)' type="button" class="btn btn-xs btn-danger" disabled><i class="fa fa-trash-o"></i></button>
                        <ul>
                            <li>Action: <span id="hover-action">None</span></li>
                            <li>Value: <span id="hover-value">None</span></li>
                        </ul>
                    </div>
                </div>

                <ol class="breadcrumb state">
                    <i class="fa fa-plus-circle"></i> Add actions
                </ol>

                <div class="row">
                    <div class="col-lg-8 col-lg-offset-2">
                        <button id='run_command' type="button"
                                onclick='popup(this.id)'
                                class="buttons-action btn btn-sm"
                                data-val='Click: Run Command'
                                disabled></button>
                        <button id='suggest_command' type="button"
                                onclick='popup(this.id)'
                                class="buttons-action btn btn-sm"
                                data-val='Click: Suggest Command'
                                disabled></button>
                        <button id='open_url' type="button"
                                onclick='popup(this.id)'
                                class="buttons-action btn btn-sm"
                                data-val='Click: Open URL'
                                disabled></button>
                        <button id='show_text' type="button"
                                onclick='popup(this.id, true)'
                                class="buttons-action btn btn-sm"
                                data-val='Hover: Show Text'
                                disabled></button>
                    </div>
                </div>

                <br>

				<ol class="breadcrumb state">
		            <i class="fa fa-align-left"></i> Enter text
		        </ol>

				<div class="row">
			        <div class="col-lg-8 col-lg-offset-2">
			            <input id="input" class="form-control" placeholder="Enter text">
			        </div>
			    </div>

                <br>

                <ol class="breadcrumb state">
                    <i class="fa fa-sign-out"></i> Export <i id="exporticon" class="fa fa-times"></i>
                </ol>

                <div class="row">
                    <div class="col-lg-8 col-lg-offset-2">
                        <input id="export" class="form-control" onclick="selectAll(this)" readonly>
                    </div>
                </div>

                <br>

            </div>
            <!-- /.container-fluid -->

        </div>
        <!-- /#page-wrapper -->
    </div>
    <!-- /#wrapper -->

    <!-- Bootstrap Core JavaScript -->
    <script src="js/bootstrap.min.js"></script>
    <script src="js/script.js"></script>

</body>

</html>
