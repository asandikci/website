<?php

namespace App\Controller\Pages\Learn;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

class ClassicalController extends AbstractController
{
    public function index(): Response
    {
        return $this->render('pages/learn/classical/index.html.twig');
    }
}
